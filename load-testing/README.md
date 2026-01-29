# StayMate Power-Pact Load Testing 🚀

This directory contains the production-grade Load Testing infrastructure for StayMate.

## 📂 Structure
- `jmeter/`: Contains the JMeter Test Plan (`.jmx`), data files, and core runner script.
  - `data/`: CSV files for Tenants, Landlords, and Property Data.
  - `staymate-load-test.jmx`: The master test plan.
  - `run-load-test.sh`: The logic script that executes JMeter.
- `reports/`: HTML Dashboards generated after tests.
- `results/`: Raw `.jtl` result files.

## ⚡️ Quick Start
You can run the load tests using the helper script in this directory.

### 1. Run Standard Load Test (Safe Mode)
By default, AI requests are **simulated** (mocked) to avoid overloading Ollama.
```bash
./Start-LoadTest.sh
```

### 2. Run Custom Load Test
You can customize users and duration via environment variables or arguments:
```bash
# 50 Tenants, 10 Landlords, 5 Minutes
TENANT_USERS=50 LANDLORD_USERS=10 TEST_DURATION=300 ./Start-LoadTest.sh
```

## 🛠 Advanced Usage
To run a "Smoke Test" that hits the **Real AI** (Ollama), edit the `Start-LoadTest.sh` or call the inner script directly:

```bash
# WARNING: This hits real Ollama API. Low concurrency only!
cd jmeter
./run-load-test.sh --tenant-users 1 --landlord-users 1 --duration 60
```
Note: You must manually edit `staymate-load-test.jmx` User Defined Variables `SIMULATION_MODE` to `false` for real AI calls, or rely on future script updates.

## 📊 Viewing Results
After the test finishes, an HTML report is generated in `reports/`.
- On macOS, it opens automatically.
- Otherwise, open `reports/load-test-report-<timestamp>/index.html` in your browser.

## ⚠️ Requirements
- Java 11+
- Apache JMeter 5.6.3+ (Installed via `brew install jmeter` on macOS)
- StayMate Backend running at `localhost:8080`
