# Integration Testing

API testing with Spring Boot Test.

---

## Example

```java
@SpringBootTest
@AutoConfigureMockMvc
class PropertyControllerTest {
    @Autowired MockMvc mockMvc;

    @Test
    @WithMockUser(roles = "HOUSE_OWNER")
    void createProperty_valid_returns201() throws Exception {
        mockMvc.perform(post("/api/properties")
                .contentType(APPLICATION_JSON)
                .content(json))
            .andExpect(status().isCreated());
    }
}
```
