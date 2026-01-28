from locust import HttpUser, task, between, SequentialTaskSet
import random
from faker import Faker

fake = Faker()

class UserBehavior(SequentialTaskSet):
    def on_start(self):
        """Register and Login a new user for each simulated user instance"""
        self.email = fake.email()
        self.password = "password123"
        self.first_name = fake.first_name()
        self.last_name = fake.last_name()
        self.token = None
        self.user_id = None

        # 1. Register
        reg_payload = {
            "email": self.email,
            "password": self.password,
            "firstName": self.first_name,
            "lastName": self.last_name
        }
        with self.client.post("/api/auth/register", json=reg_payload, catch_response=True) as response:
            if response.status_code == 201:
                response.success()
                if "token" in response.json():
                    self.token = response.json()["token"]
            else:
                response.failure(f"Registration failed: {response.text}")

        # 2. Login (if token wasn't returned in register)
        if not self.token:
            login_payload = {"email": self.email, "password": self.password}
            with self.client.post("/api/auth/login", json=login_payload, catch_response=True) as response:
                if response.status_code == 200:
                   self.token = response.json().get("token")
                else:
                    response.failure(f"Login failed: {response.text}")

        # Set headers
        if self.token:
            self.client.headers.update({"Authorization": f"Bearer {self.token}"})

    @task
    def check_metadata(self):
        """Common background polling tasks"""
        self.client.get("/api/auth/me")
        self.client.get("/api/notifications/unread-count")
        self.client.get("/api/messages/unread-count")

class TenantBehavior(UserBehavior):
    def on_start(self):
        super().on_start()
        # Select Role: TENANT
        if self.token:
            self.client.post("/api/auth/select-role", json={"role": "ROLE_TENANT"})

    @task(3)
    def browse_ecosystem(self):
        """High volume browsing"""
        self.client.get("/api/properties/recommended")
        self.client.get("/api/roommates")
        self.client.get("/api/properties/search?query=Dhaka")

    @task(2)
    def interact_with_property(self):
        """Deep dive into a property: view, save, related reviews"""
        res = self.client.get("/api/properties/search")
        if res.status_code == 200 and len(res.json()) > 0:
            prop = random.choice(res.json())
            prop_id = prop['id']

            # 1. View Details
            self.client.get(f"/api/properties/{prop_id}")

            # 2. View Reviews
            self.client.get(f"/api/reviews/property/{prop_id}")

            # 3. Save/Unsave (Toggle)
            if random.random() < 0.3:
                self.client.post(f"/api/saved/properties/{prop_id}")

    @task(1)
    def messaging_flow(self):
        """Check conversations and potentially send a message"""
        conversations = self.client.get("/api/messages/conversations").json().get('content', [])
        if conversations:
            conv = random.choice(conversations)
            conv_id = conv['id']
            # View messages
            self.client.get(f"/api/messages/conversations/{conv_id}/messages")
            # 20% chance to reply
            if random.random() < 0.2:
                self.client.post("/api/messages/send", json={
                    "conversationId": conv_id,
                    "content": fake.sentence()
                })

class LandlordBehavior(UserBehavior):
    def on_start(self):
        super().on_start()
        # Select Role: HOUSE_OWNER
        if self.token:
            self.client.post("/api/auth/select-role", json={"role": "ROLE_HOUSE_OWNER"})

    @task(3)
    def dashboard_monitoring(self):
        """Owners check their properties and requests often"""
        self.client.get("/api/properties/my-properties")
        self.client.get("/api/bookings/requests")

    @task(1)
    def manage_notifications(self):
        """Read and clear notifications"""
        notifs = self.client.get("/api/notifications").json().get('content', [])
        if notifs:
            notif = random.choice(notifs)
            self.client.post(f"/api/notifications/{notif['id']}/read")

class AnonymousUser(HttpUser):
    wait_time = between(1, 5)

    @task
    def public_browsing(self):
        self.client.get("/api/properties/recommended")
        self.client.get("/api/roommates")
        self.client.get("/api/properties/search")

class TenantUser(HttpUser):
    tasks = [TenantBehavior]
    wait_time = between(2, 8)

class LandlordUser(HttpUser):
    tasks = [LandlordBehavior]
    wait_time = between(3, 10)
