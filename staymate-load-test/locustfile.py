"""
StayMate Load Test Suite - Ultimate Version
============================================
Full API Coverage for StayMate.

Run with: locust -f staymate-load-test/locustfile.py --host=http://localhost:8080
"""

import json
import random
import uuid
import datetime
import logging
from locust import HttpUser, task, between, tag, events

# --- Configuration ---
ADMIN_EMAIL = "mpuspo2310304@bscse.uiu.ac.bd"
ADMIN_PASSWORD = "password"

# Response time thresholds (ms)
FAST_THRESHOLD = 200
NORMAL_THRESHOLD = 500
SLOW_THRESHOLD = 1000

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Base User Class ---
class StayMateUser(HttpUser):
    abstract = True
    token = None
    refresh_token = None
    user_id = None
    email = None
    password = "TestPassword123+"
    role_label = "User"

    @property
    def headers(self):
        h = {"Content-Type": "application/json"}
        if self.token:
            h["Authorization"] = f"Bearer {self.token}"
        return h

    def req_name(self, action):
        return f"[{self.role_label}] {action}"

    def register(self, role):
        uid = uuid.uuid4().hex[:8]
        self.email = f"loadtest_{role.lower()}_{uid}@example.com"
        payload = {
            "email": self.email,
            "password": self.password,
            "firstName": f"Test{role.capitalize()}",
            "lastName": uid,
            "phoneNumber": f"555{random.randint(1000000, 9999999)}",
            "role": role,
            "bio": "Load testing user",
        }
        with self.client.post("/api/auth/register", json=payload, catch_response=True, name="[Auth] Register") as response:
            if response.status_code in [200, 201]:
                data = response.json()
                self.token = data.get("accessToken")
                self.refresh_token = data.get("refreshToken")
                self.user_id = data.get("userId")
            elif response.status_code == 409:
                 response.success() # Ignore duplicate emails in load test

    def login(self, email, password):
        payload = {"email": email, "password": password}
        with self.client.post("/api/auth/login", json=payload, catch_response=True, name="[Auth] Login") as response:
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("accessToken")
                self.refresh_token = data.get("refreshToken")
                self.user_id = data.get("userId")
            else:
                logger.error(f"Login failed for {email}: {response.status_code} - {response.text}")

    # --- Common Tasks ---
    @task(3)
    def check_notifications(self):
        if not self.token: return
        self.client.get("/api/notifications", headers=self.headers, name=self.req_name("Notifications"))
        self.client.get("/api/notifications/unread-count", headers=self.headers, name=self.req_name("Notif Unread Count"))

    @task(1)
    def check_profile(self):
        if not self.token: return
        self.client.get("/api/users/profile", headers=self.headers, name=self.req_name("Get Profile"))

    @task(1)
    def support_tickets(self):
        if not self.token: return
        # List
        with self.client.get("/api/support/my-tickets", headers=self.headers, catch_response=True, name=self.req_name("List Tickets")) as r:
            if r.status_code == 200:
                tickets = r.json()
                if isinstance(tickets, dict): tickets = tickets.get("content", [])
                if tickets:
                     t = random.choice(tickets)
                     self.client.get(f"/api/support/{t['id']}", headers=self.headers, name=self.req_name("View Ticket"))

        # Create
        if random.random() < 0.1:
            payload = {
                "subject": f"Issue {uuid.uuid4().hex[:4]}",
                "category": random.choice(["TECHNICAL", "BILLING"]),
                "message": "Help me",
                "priority": "LOW"
            }
            self.client.post("/api/support", json=payload, headers=self.headers, name=self.req_name("Create Ticket"))


# --- Tenant User ---
class TenantUser(StayMateUser):
    wait_time = between(2, 6)
    weight = 7
    role_label = "Tenant"

    viewed_properties = []
    my_bookings = []
    roommate_posts = []

    def on_start(self):
        self.register("USER")

    # --- Properties ---
    @task(5)
    def browse_properties(self):
        # Recommended
        self.client.get("/api/properties/recommended", headers=self.headers, name=self.req_name("Recommended Props"))
        # Search
        term = random.choice(["", "Apt", "House", "Room"])
        with self.client.get(f"/api/properties/search?keyword={term}", headers=self.headers, catch_response=True, name=self.req_name("Search Props")) as r:
            if r.status_code == 200:
                props = r.json()
                if isinstance(props, dict): props = props.get("content", [])
                if props:
                    p = random.choice(props)
                    self.viewed_properties.append(p)
                    self.client.get(f"/api/properties/{p['id']}", headers=self.headers, name=self.req_name("View Prop Details"))

                    # Save
                    if random.random() < 0.2:
                        self.client.post(f"/api/saved/properties/{p['id']}", headers=self.headers, name=self.req_name("Save Prop"))

    # --- Bookings ---
    @task(2)
    def manage_bookings(self):
        if not self.token: return
        # List
        with self.client.get("/api/bookings/my-bookings", headers=self.headers, catch_response=True, name=self.req_name("My Bookings")) as r:
            if r.status_code == 200:
                self.my_bookings = r.json()

        # Create Booking
        if self.viewed_properties and random.random() < 0.3:
            p = random.choice(self.viewed_properties)
            start = datetime.date.today() + datetime.timedelta(days=random.randint(5, 60))
            end = start + datetime.timedelta(days=7)
            payload = {
                "propertyId": p['id'],
                "startDate": str(start),
                "endDate": str(end),
                "notes": "Locust Automated Booking"
            }
            res = self.client.post("/api/bookings", json=payload, headers=self.headers, catch_response=True, name=self.req_name("Create Booking"))
            if res.status_code in [200, 201]:
                self.my_bookings.append(res.json())

    # --- Roommates ---
    @task(3)
    def roommate_activities(self):
        if not self.token: return

        # List Matches
        self.client.get("/api/roommates/matches", headers=self.headers, name=self.req_name("Roommate Matches"))

        # Create Post
        if random.random() < 0.1:
            payload = {
                "location": "New York", "budget": 1500, "moveInDate": str(datetime.date.today()),
                "bio": "Looking for room", "cleanliness": "CLEAN", "sleepSchedule": "EARLY_BIRD",
                "lifestyle": "STUDENT", "genderPreference": "ANY", "petPreference": "NO_PETS"
            }
            self.client.post("/api/roommates", json=payload, headers=self.headers, name=self.req_name("Create Roommate Post"))

        # Search
        with self.client.get("/api/roommates", headers=self.headers, catch_response=True, name=self.req_name("Search Roommates")) as r:
            if r.status_code == 200:
                posts = r.json()
                if isinstance(posts, dict): posts = posts.get("content", [])
                if posts:
                    target = random.choice(posts)
                    # Apply
                    if target.get("userId") != self.user_id:
                         inv_payload = {"roommatePostId": target['id'], "message": "Hi, interested!"}
                         self.client.post("/api/applications", json=inv_payload, headers=self.headers, name=self.req_name("Apply Roommate"))

    @task(1)
    def manage_applications(self):
        if not self.token: return
        self.client.get("/api/applications/sent", headers=self.headers, name=self.req_name("Sent Apps"))
        with self.client.get("/api/applications/received", headers=self.headers, catch_response=True, name=self.req_name("Received Apps")) as r:
            if r.status_code == 200:
                apps = r.json()
                if apps:
                    a = random.choice(apps)
                    if a['status'] == 'PENDING':
                        new_status = random.choice(["ACCEPTED", "REJECTED"])
                        self.client.patch(f"/api/applications/{a['id']}/status?status={new_status}", headers=self.headers, name=self.req_name("Update App Status"))

    # --- Maintenance & Reviews ---
    @task(1)
    def maintain_and_review(self):
        if not self.token: return
        # My Requests
        self.client.get("/api/maintenance/my-requests", headers=self.headers, name=self.req_name("My Maintenance"))

        # Create Request if booked
        if self.my_bookings and random.random() < 0.2:
            b = random.choice(self.my_bookings)
            payload = {"propertyId": b['propertyId'], "title": "Leak", "description": "Water leaking", "priority": "HIGH"}
            self.client.post("/api/maintenance", json=payload, headers=self.headers, name=self.req_name("Create Maintenance"))

        # Leave Review
        if self.my_bookings and random.random() < 0.2:
             b = random.choice(self.my_bookings)
             payload = {"propertyId": b['propertyId'], "rating": 5, "comment": "Great place!"}
             self.client.post("/api/reviews", json=payload, headers=self.headers, name=self.req_name("Leave Review"))

    @task(1)
    def view_dashboard(self):
        if not self.token: return
        self.client.get("/api/dashboard/user", headers=self.headers, name=self.req_name("User Dashboard"))


# --- Landlord User ---
class LandlordUser(StayMateUser):
    wait_time = between(4, 10)
    weight = 3
    role_label = "Landlord"

    def on_start(self):
        self.register("HOUSE_OWNER")

    @task(1)
    def view_dashboard(self):
        if not self.token: return
        self.client.get("/api/dashboard/landlord", headers=self.headers, name=self.req_name("Landlord Dashboard"))
        self.client.get("/api/landlord/dashboard/overview", headers=self.headers, name=self.req_name("Landlord Overview"))

    @task(3)
    def manage_properties(self):
        if not self.token: return
        # List
        self.client.get("/api/properties/my-properties", headers=self.headers, name=self.req_name("My Properties"))
        self.client.get("/api/landlord/properties/summary", headers=self.headers, name=self.req_name("Prop Summary"))

        # Create Property
        if random.random() < 0.15:
            prop = {
                "title": f"Luxury Apt {uuid.uuid4().hex[:4]}",
                "description": "Beautiful view",
                "price": random.randint(1000, 5000),
                "address": "123 Main St", "city": "NYC", "state": "NY", "zipCode": "10001",
                "beds": 2, "baths": 2, "area": 1200, "propertyType": "APARTMENT",
                "amenities": ["WIFI", "PARKING"]
            }
            files = {"data": (None, json.dumps(prop), "application/json")}
            self.client.post("/api/properties", files=files, headers={"Authorization": f"Bearer {self.token}"}, name=self.req_name("Create Prop"))

    @task(3)
    def handle_incoming(self):
        if not self.token: return
        # Bookings
        with self.client.get("/api/bookings/requests", headers=self.headers, catch_response=True, name=self.req_name("Booking Requests")) as r:
            if r.status_code == 200:
                reqs = r.json()
                if isinstance(reqs, dict): reqs = reqs.get("content", [])
                for b in reqs[:2]:
                    if b['status'] == 'PENDING':
                        action = random.choice(["CONFIRMED", "REJECTED"])
                        self.client.patch(f"/api/bookings/{b['id']}/status?status={action}", headers=self.headers, name=self.req_name("Update Booking"))

        # Maintenance
        with self.client.get("/api/maintenance/property-requests", headers=self.headers, catch_response=True, name=self.req_name("Prop Maintenance")) as r:
            if r.status_code == 200:
                 reqs = r.json()
                 if isinstance(reqs, dict): reqs = reqs.get("content", [])
                 for m in reqs[:2]:
                     if m['status'] == 'OPEN':
                         self.client.patch(f"/api/maintenance/{m['id']}/status?status=IN_PROGRESS", headers=self.headers, name=self.req_name("Update Maintenance"))

    @task(1)
    def finance(self):
        if not self.token: return
        self.client.get("/api/finance/earnings", headers=self.headers, name=self.req_name("Earnings"))
        self.client.get("/api/finance/payout-methods", headers=self.headers, name=self.req_name("Payout Methods"))


# --- Admin User ---
class AdminUser(StayMateUser):
    wait_time = between(5, 15)
    weight = 1
    role_label = "Admin"

    def on_start(self):
        self.login(ADMIN_EMAIL, ADMIN_PASSWORD)

    @task(1)
    def view_dashboards(self):
        if not self.token: return
        self.client.get("/api/dashboard/admin", headers=self.headers, name=self.req_name("Admin Dashboard"))
        self.client.get("/api/admin/dashboard", headers=self.headers, name=self.req_name("Admin Stats"))
        self.client.get("/api/admin/analytics/financial-overview", headers=self.headers, name=self.req_name("Financial Overview"))
        self.client.get("/api/admin/analytics/user-growth", headers=self.headers, name=self.req_name("User Growth"))

    @task(2)
    def moderation_properties(self):
        if not self.token: return
        with self.client.get("/api/admin/properties", headers=self.headers, catch_response=True, name=self.req_name("List Props")) as r:
            if r.status_code == 200:
                props = r.json()
                if isinstance(props, dict): props = props.get("content", [])
                for p in props[:3]:
                    if p['status'] == 'PENDING':
                         action = "approve" if random.random() > 0.2 else "reject"
                         self.client.put(f"/api/admin/properties/{p['id']}/{action}", headers=self.headers, name=self.req_name(f"{action} Prop"))

    @task(2)
    def moderation_users_verifications(self):
        if not self.token: return
        # Reports
        self.client.get("/api/admin/reports", headers=self.headers, name=self.req_name("View Reports"))
        # Verifications
        with self.client.get("/api/verification/admin/pending", headers=self.headers, catch_response=True, name=self.req_name("Pending Verifications")) as r:
            if r.status_code == 200:
                verifs = r.json()
                if isinstance(verifs, dict): verifs = verifs.get("content", [])
                for v in verifs[:2]:
                    self.client.post(f"/api/verification/admin/{v['id']}/approve", headers=self.headers, name=self.req_name("Approve Verif"))

    @task(1)
    def admin_finance(self):
         if not self.token: return
         self.client.get("/api/finance/admin/earnings", headers=self.headers, name=self.req_name("Admin Earnings"))
         self.client.get("/api/finance/admin/payout-requests", headers=self.headers, name=self.req_name("Admin Payout Reqs"))
