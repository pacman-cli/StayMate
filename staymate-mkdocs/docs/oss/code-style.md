# Code Style

Java code style guidelines for StayMate.

---

## General Rules

- **Indentation**: 4 spaces (no tabs)
- **Line length**: 120 characters max
- **Encoding**: UTF-8
- **Newline**: LF (Unix-style)

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Class | PascalCase | `PropertyService` |
| Method | camelCase | `createProperty()` |
| Variable | camelCase | `propertyId` |
| Constant | UPPER_SNAKE | `MAX_RETRIES` |
| Package | lowercase | `com.webapp.domain` |

---

## Annotations Order

```java
@Entity
@Table(name = "properties")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Property {
```

---

## Import Order

1. `java.*`
2. `javax.*`
3. `org.springframework.*`
4. `com.webapp.*`
5. Static imports

---

## Method Structure

```java
@Override
@Transactional
public PropertyResponse createProperty(CreatePropertyRequest request) {
    // 1. Validate
    User owner = userService.getCurrentUser();

    // 2. Transform
    Property property = propertyMapper.toEntity(request);
    property.setOwner(owner);

    // 3. Persist
    Property saved = propertyRepository.save(property);

    // 4. Return
    return propertyMapper.toResponse(saved);
}
```
