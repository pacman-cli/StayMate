# Validation

Input validation with Bean Validation.

---

## Request Validation

```java
public class CreatePropertyRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200)
    private String title;

    @NotNull(message = "Price is required")
    @Positive
    private BigDecimal price;

    @Valid
    @NotNull
    private LocationRequest location;
}
```

---

## Controller Usage

```java
@PostMapping
public ResponseEntity<PropertyResponse> create(
        @Valid @RequestBody CreatePropertyRequest request) {
    // Validation errors → 400 Bad Request
}
```
