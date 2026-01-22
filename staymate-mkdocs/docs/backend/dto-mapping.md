# DTO Mapping

Entity to DTO conversion patterns.

---

## Mapper Pattern

```java
@Component
public class PropertyMapper {

    public PropertyResponse toResponse(Property property) {
        PropertyResponse response = new PropertyResponse();
        response.setId(property.getId());
        response.setTitle(property.getTitle());
        response.setPrice(property.getPrice());
        return response;
    }

    public Property toEntity(CreatePropertyRequest request) {
        Property property = new Property();
        property.setTitle(request.getTitle());
        property.setPrice(request.getPrice());
        return property;
    }
}
```

---

## Benefits

- Separation of API contract from entities
- Security: hide internal fields
- Flexibility: independent evolution
