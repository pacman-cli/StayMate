"""
StayMate – Clean & Fixed Load Test (Locust)
==========================================
✔ Integer task weights only
✔ Probability-based execution
✔ Clean API coverage
"""

import random
import uuid
import datetime
from locust import HttpUser, task, between

# ---------------- CONFIG ----------------
ADMIN_EMAIL = "mpuspo2310304@bscse.uiu.ac.bd"
ADMIN_PASSWORD = "password"


# --------------- BASE USER ---------------
class BaseUser(HttpUser):
    abstract = True
    token = None
    user_id = None
    password = "TestPassword123+"

    def headers(self):
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.token}"
        } if self.token else {"Content-Type": "application/json"}

    def register(self, role):
        uid = uuid.uuid4().hex[:6]
        email = f"load_{role.lower()}_{uid}@example.com"

        payload = {
            "email": email,
            "password": self.password,
            "firstName": role,
            "lastName": uid,
            "role": role
        }

        res = self.client.post("/api/auth/register", json=payload, name="Auth:Register")
        if res.status_code in (200, 201):
            data = res.json()
            self.token = data.get("accessToken")
            self.user_id = data.get("userId")

    def login(self, email, password):
        res = self.client.post(
            "/api/auth/login",
            json={"email": email, "password": password},
            name="Auth:Login"
        )
        if res.status_code == 200:
            data = res.json()
            self.token = data.get("accessToken")
            self.user_id = data.get("userId")


# ================= TENANT =================
class TenantUser(BaseUser):
    wait_time = between(2, 5)
    weight = 6

    viewed_properties = []
    bookings = []

    def on_start(self):
        self.register("USER")

    @task(5)
    def browse_properties(self):
        self.client.get("/api/properties/recommended", headers=self.headers(), name="Tenant:Recommended")

        res = self.client.get("/api/properties/search", headers=self.headers(), name="Tenant:Search")
        if res.status_code == 200:
            props = res.json().get("content", [])
            if props:
                p = random.choice(props)
                self.viewed_properties.append(p)
                self.client.get(f"/api/properties/{p['id']}", headers=self.headers(), name="Tenant:View Property")

    @task(2)
    def create_booking(self):
        if not self.viewed_properties or random.random() > 0.3:
            return

        p = random.choice(self.viewed_properties)
        start = datetime.date.today() + datetime.timedelta(days=7)

        payload = {
            "propertyId": p["id"],
            "startDate": str(start),
            "endDate": str(start + datetime.timedelta(days=5))
        }

        res = self.client.post("/api/bookings", json=payload, headers=self.headers(), name="Tenant:Create Booking")
        if res.status_code in (200, 201):
            self.bookings.append(res.json())

    @task(1)
    def dashboard(self):
        self.client.get("/api/dashboard/user", headers=self.headers(), name="Tenant:Dashboard")

    @task(1)
    def notifications(self):
        self.client.get("/api/notifications", headers=self.headers(), name="Tenant:Notifications")


# ================= LANDLORD =================
class LandlordUser(BaseUser):
    wait_time = between(4, 8)
    weight = 3

    def on_start(self):
        self.register("HOUSE_OWNER")

    @task(3)
    def properties(self):
        self.client.get("/api/properties/my-properties", headers=self.headers(), name="Landlord:My Properties")

        if random.random() > 0.2:
            return

        payload = {
            "title": f"Apt {uuid.uuid4().hex[:4]}",
            "price": random.randint(1200, 4000),
            "city": "NYC",
            "propertyType": "APARTMENT"
        }

        self.client.post("/api/properties", json=payload, headers=self.headers(), name="Landlord:Create Property")

    @task(1)
    def dashboard(self):
        self.client.get("/api/dashboard/landlord", headers=self.headers(), name="Landlord:Dashboard")


# ================= ADMIN =================
class AdminUser(BaseUser):
    wait_time = between(6, 12)
    weight = 1

    def on_start(self):
        self.login(ADMIN_EMAIL, ADMIN_PASSWORD)

    @task(3)
    def admin_dashboard(self):
        self.client.get("/api/dashboard/admin", headers=self.headers(), name="Admin:Dashboard")

    @task(1)
    def financial_overview(self):
        if random.random() > 0.3:
            return
        self.client.get(
            "/api/admin/analytics/financial-overview",
            headers=self.headers(),
            name="Admin:Finance Overview"
        )

    @task(1)
    def user_growth(self):
        if random.random() > 0.3:
            return
        self.client.get(
            "/api/admin/analytics/user-growth",
            headers=self.headers(),
            name="Admin:User Growth"
        )
