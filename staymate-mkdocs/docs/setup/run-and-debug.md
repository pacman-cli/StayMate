# Run & Debug

IDE configuration and debugging techniques.

---

## Running in IDE

### IntelliJ IDEA

1. **Open Project**
   ```
   File → Open → Select "server" folder → Open as Project
   ```

2. **Configure JDK**
   ```
   File → Project Structure → Project → SDK → Java 17
   ```

3. **Run Configuration**
   ```
   Run → Edit Configurations → + → Spring Boot
   - Main class: com.webapp.Application
   - VM options: -Dspring.profiles.active=dev
   ```

4. **Run**
   ```
   Shift + F10 (Windows/Linux)
   Ctrl + R (macOS)
   ```

### VS Code

1. **Install Extensions**
   - Extension Pack for Java
   - Spring Boot Extension Pack

2. **Run**
   - Open `Application.java`
   - Click "Run" above `main()` method

---

## Debugging

### IntelliJ IDEA

```mermaid
flowchart LR
    BP[Set Breakpoint] --> DEBUG[Debug Mode]
    DEBUG --> REQ[Send Request]
    REQ --> HIT[Breakpoint Hit]
    HIT --> INSPECT[Inspect Variables]
    INSPECT --> STEP[Step Through]
```

1. **Set Breakpoint**
   - Click in gutter next to line number
   - Red dot appears

2. **Start Debug Mode**
   ```
   Shift + F9 (Windows/Linux)
   Ctrl + D (macOS)
   ```

3. **Trigger Breakpoint**
   - Send request via curl/Postman
   - Debugger pauses at breakpoint

4. **Debug Controls**

   | Key | Action |
   |-----|--------|
   | F8 | Step Over |
   | F7 | Step Into |
   | Shift+F8 | Step Out |
   | F9 | Resume |

### Remote Debugging

```bash
# Run with debug port
./mvnw spring-boot:run \
  -Dspring-boot.run.jvmArguments="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005"
```

In IntelliJ:
```
Run → Edit Configurations → + → Remote JVM Debug
- Port: 5005
```

---

## Hot Reload

DevTools is included for automatic restart on code changes.

```xml
<!-- Already in pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
</dependency>
```

!!! tip "IntelliJ Setup"
    Enable auto-build for hot reload:

    1. `Settings → Build → Compiler → Build project automatically`
    2. `Settings → Advanced Settings → Allow auto-make...`

---

## Useful Commands

### Run with Profile

```bash
# Development (more logging)
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Production simulation
./mvnw spring-boot:run -Dspring-boot.run.profiles=prod
```

### Run Tests

```bash
# All tests
./mvnw test

# Specific test class
./mvnw test -Dtest=PropertyServiceTest

# Skip tests (for quick builds)
./mvnw package -DskipTests
```

### Build JAR

```bash
./mvnw clean package -DskipTests
java -jar target/software-project-0.0.1-SNAPSHOT.jar
```

---

## Logs

### Log Levels

```properties
# application.properties
logging.level.com.webapp=DEBUG          # Application
logging.level.org.hibernate.SQL=DEBUG   # SQL queries
logging.level.org.springframework.security=DEBUG  # Security
```

### Log Output

```bash
# Follow logs in real-time
tail -f server/logs/application.log

# Or in console, look for:
INFO  c.w.auth.controller.AuthController : Login attempt for: user@example.com
DEBUG c.w.auth.security.JwtTokenProvider : Generated token for userId: 42
```

---

## Next Step

→ [Common Errors](common-errors.md)
