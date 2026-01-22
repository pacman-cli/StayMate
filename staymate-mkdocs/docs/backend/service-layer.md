# Service Layer

Business logic implementation patterns.

---

## Pattern

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PropertyServiceImpl implements PropertyService {

    private final PropertyRepository propertyRepository;
    private final PropertyMapper propertyMapper;

    @Override
    @Transactional
    public PropertyResponse createProperty(CreatePropertyRequest request) {
        Property property = propertyMapper.toEntity(request);
        Property saved = propertyRepository.save(property);
        return propertyMapper.toResponse(saved);
    }
}
```

---

## Best Practices

- Use `@Transactional(readOnly = true)` as default
- Inject interfaces, not implementations
- Keep business logic in services, not controllers
- Use mappers for DTO conversions
