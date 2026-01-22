# Repository Layer

Data access patterns with Spring Data JPA.

---

## Interface Pattern

```java
public interface PropertyRepository extends JpaRepository<Property, Long> {

    Page<Property> findByOwner(User owner, Pageable pageable);

    @Query("SELECT p FROM Property p WHERE p.status = :status")
    List<Property> findByStatus(@Param("status") PropertyStatus status);

    boolean existsByIdAndOwner(Long id, User owner);
}
```

---

## Key Features

- Extends `JpaRepository` for CRUD
- Query methods from naming conventions
- Custom `@Query` for complex queries
- Pagination with `Pageable`
