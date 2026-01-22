# API Integration

Axios client configuration for backend communication.

---

## Configuration

Located at `src/lib/api.ts`:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});
```

---

## Request Interceptor

Adds JWT token to all requests:

```typescript
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

---

## Response Interceptor

Handles token refresh on 401:

```typescript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/api/auth/refresh-token', {
          refreshToken,
        });

        localStorage.setItem('accessToken', response.data.accessToken);
        originalRequest.headers.Authorization =
          `Bearer ${response.data.accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);
```

---

## API Calls

### Authentication

```typescript
// Login
const response = await api.post('/api/auth/login', {
  email,
  password,
});

// Register
const response = await api.post('/api/auth/register', {
  email,
  password,
  firstName,
  lastName,
});

// Get current user
const response = await api.get('/api/auth/me');
```

### Properties

```typescript
// Search properties
const response = await api.get('/api/properties', {
  params: { city, minPrice, maxPrice, page },
});

// Get property details
const response = await api.get(`/api/properties/${id}`);

// Create property (landlord)
const response = await api.post('/api/properties', propertyData);
```

### Bookings

```typescript
// Create booking
const response = await api.post('/api/bookings', {
  propertyId,
  startDate,
  endDate,
});

// Get my bookings
const response = await api.get('/api/bookings/my-bookings');
```

---

## Error Handling

```typescript
try {
  const response = await api.post('/api/bookings', data);
  toast.success('Booking created!');
} catch (error) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || 'An error occurred';
    toast.error(message);
  }
}
```

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
```

!!! warning "Public Variables"
    Only `NEXT_PUBLIC_*` variables are exposed to the browser. Never put secrets in these variables.
