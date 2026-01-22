# Prerequisites

Software requirements for running StayMate locally.

---

## Required Software

| Software | Version | Purpose | Check Command |
|----------|---------|---------|---------------|
| **Java JDK** | 17+ (LTS) | Runtime | `java -version` |
| **Maven** | 3.8+ | Build tool | `mvn -version` |
| **MySQL** | 8.0+ | Database | `mysql --version` |
| **Docker** | 20.10+ | MinIO container | `docker --version` |
| **Git** | 2.30+ | Version control | `git --version` |

---

## Installation

=== "macOS"

    ```bash
    # Install Homebrew if not installed
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    # Install Java 17
    brew install openjdk@17
    echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
    source ~/.zshrc

    # Install Maven
    brew install maven

    # Install MySQL
    brew install mysql
    brew services start mysql

    # Install Docker
    brew install --cask docker
    ```

=== "Ubuntu/Debian"

    ```bash
    # Update packages
    sudo apt update

    # Install Java 17
    sudo apt install openjdk-17-jdk -y

    # Install Maven
    sudo apt install maven -y

    # Install MySQL
    sudo apt install mysql-server -y
    sudo systemctl start mysql
    sudo mysql_secure_installation

    # Install Docker
    sudo apt install docker.io docker-compose -y
    sudo usermod -aG docker $USER
    ```

=== "Windows"

    ```powershell
    # Using Chocolatey
    choco install openjdk17 maven mysql docker-desktop git -y

    # Or download installers manually:
    # Java: https://adoptium.net/
    # Maven: https://maven.apache.org/download.cgi
    # MySQL: https://dev.mysql.com/downloads/installer/
    # Docker: https://www.docker.com/products/docker-desktop
    ```

---

## Verification

Run these commands to verify your setup:

```bash
# Java (must be 17+)
$ java -version
openjdk version "17.0.9" 2023-10-17

# Maven (must be 3.8+)
$ mvn -version
Apache Maven 3.9.5

# MySQL (must be 8.0+)
$ mysql --version
mysql  Ver 8.0.35


# Docker
$ docker --version
Docker version 24.0.7
```

!!! warning "Java Version"
    StayMate requires **Java 17**. Java 8 or 11 will not work.

    ```bash
    # Check exact version
    java -version 2>&1 | head -1
    ```

---

## Optional Tools

| Tool | Purpose |
|------|---------|
| **IntelliJ IDEA** | IDE with Spring support |
| **Postman/Swagger** | API testing |
| **MySQL Workbench** | Database GUI |
| **k6** | Load testing |

---

## Next Step

→ [Database Setup](database-setup.md)
