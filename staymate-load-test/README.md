# StayMate Role-Based Load Testing API Documentation

This document outlines the API endpoints, their required roles, and the load testing strategy for the StayMate application using Locust.

## User Roles
The application defines three primary roles (`RoleName` enum):
1.  **`ROLE_ADMIN`**: Administrator with full access to dashboard stats and maintenance.
2.  **`ROLE_HOUSE_OWNER`**: Landlord who can list properties and manage bookings.
3.  **`ROLE_USER`**: Tenant who can search properties and make bookings.

## API Endpoints & Access Control

### Authentication (`/api/auth`)
| Method | Endpoint | Role Required | Description |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Public | Register a new user (Role: USER or HOUSE_OWNER) |
| POST | `/api/auth/login` | Public | Login to receive JWT token |
| POST | `/api/auth/refresh-token`| Public | Refresh access token |
| POST | `/api/auth/select-role` | Authenticated | Select role if not set (mostly for OAuth) |
| GET | `/api/auth/me` | Authenticated | Get current user details |

### Properties (`/api/properties`)
| Method | Endpoint | Role Required | Description |
| :--- | :--- | :--- | :--- |
| GET | `/api/properties/search` | Public/Auth | Search properties with filters |
| GET | `/api/properties/{id}` | Public/Auth | Get property details |
| GET | `/api/properties/my-properties`| Authenticated | Get properties owned by current user |
| POST | `/api/properties` | HOUSE_OWNER, ADMIN | Create a new property listing (Multipart) |
| PUT | `/api/properties/{id}` | HOUSE_OWNER, ADMIN | Update a property |
| PATCH | `/api/properties/{id}/status`| HOUSE_OWNER, ADMIN | Update property status (e.g., AVAILABLE) |
| DELETE | `/api/properties/{id}` | HOUSE_OWNER, ADMIN | Delete a property |

### Bookings (`/api/bookings`)
| Method | Endpoint | Role Required | Description |
| :--- | :--- | :--- | :--- |
| POST | `/api/bookings` | Authenticated | Create a new booking request |
| GET | `/api/bookings/my-bookings`| Authenticated | Get bookings made by the current user |
| GET | `/api/bookings/requests` | Authenticated | Get booking requests received (for owners) |
| PATCH | `/api/bookings/{id}/status`| Authenticated | Update booking status (CONFIRMED/REJECTED) |

### Admin (`/api/admin`)
| Method | Endpoint | Role Required | Description |
| :--- | :--- | :--- | :--- |
| GET | `/api/admin/dashboard` | ADMIN | Get admin dashboard statistics |
| GET | `/api/admin/stats` | ADMIN | Alias for dashboard stats |
| POST | `/api/admin/fraud/scan` | ADMIN | Trigger diverse fraud detection scans |

## Load Testing Strategy (Locust)

The `locustfile.py` implements three user classes:

1.  **`AdminUser`**:
    - Logs in using pre-configured admin credentials.
    - Periodically fetches dashboard stats and triggers fraud scans.

2.  **`LandlordUser`**:
    - Registers a new account with `ROLE_HOUSE_OWNER`.
    - Creates a dummy property listing.
    - Checks "My Properties" and "Booking Requests".

3.  **`TenantUser`**:
    - Registers a new account with `ROLE_USER`.
    - Searches for properties.
    - Pick a random property and submits a Booking Request.
    - Checks "My Bookings".

## Running the Tests

1.  **Install Locust**:
    ```bash
    pip3 install locust
    ```

2.  **Run with Web UI**:
    ```bash
    locust -f locustfile.py
    ```
    - Open `http://localhost:8089`.
    - Set Target Host to your backend (e.g., `http://localhost:8080`).
    - Start swarming!

3.  **Run Headless (CLI)**:
    ```bash
    locust -f locustfile.py --headless -u 100 -r 10 --run-time 1m --host http://localhost:8080
    ```
