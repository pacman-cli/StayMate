# CI/CD Pipeline

Continuous Integration and Deployment configuration.

---

## Pipeline Overview

```mermaid
graph LR
    CODE[Push Code] --> BUILD[Build]
    BUILD --> TEST[Test]
    TEST --> LINT[Lint]
    LINT --> SCAN[Security Scan]
    SCAN --> DEPLOY[Deploy]
```

---

## GitHub Actions Example

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'

    - name: Build
      run: ./mvnw clean compile

    - name: Test
      run: ./mvnw test

    - name: Package
      run: ./mvnw package -DskipTests
```

---

## Pipeline Stages

| Stage | Purpose | Tools |
|-------|---------|-------|
| Build | Compile code | Maven |
| Test | Run unit tests | JUnit, Mockito |
| Lint | Code quality | Checkstyle |
| Scan | Security | OWASP |
| Deploy | Release | Docker |
