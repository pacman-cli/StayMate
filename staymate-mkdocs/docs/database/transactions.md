# Transactions

Transaction management patterns.

---

## Default Configuration

```java
@Service
@Transactional(readOnly = true)  // Default read-only
public class PropertyServiceImpl implements PropertyService {

    @Override
    @Transactional  // Write transaction
    public PropertyResponse createProperty(CreatePropertyRequest request) {
        // Modifying data
    }

    @Override
    public PropertyResponse getProperty(Long id) {
        // Read-only query
    }
}
```

---

## Isolation Levels

| Level | Use Case |
|-------|----------|
| READ_COMMITTED | Default, most queries |
| SERIALIZABLE | Financial operations |

---

## Rollback Behavior

```java
@Transactional
public void createBookingWithPayment() {
    bookingRepository.save(booking);  // Rolled back if payment fails
    paymentService.process(payment);  // Exception rolls back
}
```
