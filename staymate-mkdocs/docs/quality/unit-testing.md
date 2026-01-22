# Unit Testing

Unit testing with JUnit 5 and Mockito.

---

## Example

```java
@ExtendWith(MockitoExtension.class)
class PropertyServiceTest {
    @Mock PropertyRepository repository;
    @InjectMocks PropertyServiceImpl service;

    @Test
    void getProperty_exists_returnsResponse() {
        when(repository.findById(1L)).thenReturn(Optional.of(property));
        PropertyResponse result = service.getProperty(1L);
        assertThat(result.getId()).isEqualTo(1L);
    }
}
```
