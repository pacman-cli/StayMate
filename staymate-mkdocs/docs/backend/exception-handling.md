# Exception Handling

Centralized error handling with GlobalExceptionHandler.

---

## Handler

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
            ResourceNotFoundException ex) {
        return ResponseEntity.status(404)
            .body(new ErrorResponse("Not Found", ex.getMessage()));
    }
}
```

---

## Exception Mapping

| Exception | HTTP Status |
|-----------|-------------|
| ResourceNotFoundException | 404 |
| BadRequestException | 400 |
| AccessDeniedException | 403 |
| AuthenticationException | 401 |

See [Failure Handling](../architecture/failure-handling.md) for details.
