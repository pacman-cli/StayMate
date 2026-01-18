#!/bin/bash

# StayMate Load Test Runner
# Wrapper script for running Locust load tests

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCUST_FILE="$SCRIPT_DIR/locustfile.py"
DEFAULT_HOST="http://localhost:8080"

# Check if locust is installed
if ! command -v locust &> /dev/null; then
    echo "Error: 'locust' is not installed."
    echo "Please run: pip3 install locust"
    exit 1
fi

echo "========================================="
echo "   StayMate Load Test Runner (Locust)    "
echo "========================================="
echo "1. Run with Web UI (Interactive)"
echo "2. Run Headless (CLI Automation)"
echo "========================================="
read -p "Select an option [1]: " OPTION
OPTION=${OPTION:-1}

if [ "$OPTION" -eq 1 ]; then
    echo ""
    echo "Starting Locust Web UI..."
    echo "Open http://localhost:8089 in your browser."
    echo "Target Host: $DEFAULT_HOST"
    echo "Press Ctrl+C to stop."
    echo ""
    locust -f "$LOCUST_FILE" --host "$DEFAULT_HOST"

elif [ "$OPTION" -eq 2 ]; then
    echo ""
    read -p "Target Host [$DEFAULT_HOST]: " HOST
    HOST=${HOST:-$DEFAULT_HOST}

    read -p "Number of Users [100]: " USERS
    USERS=${USERS:-100}

    read -p "Spawn Rate (users/sec) [10]: " RATE
    RATE=${RATE:-10}

    read -p "Run Time (e.g., 1m, 30s) [1m]: " TIME
    TIME=${TIME:-1m}

    echo ""
    echo "Starting Headless Load Test..."
    echo "Host: $HOST | Users: $USERS | Rate: $RATE/s | Time: $TIME"
    echo "--------------------------------------------------------"

    locust -f "$LOCUST_FILE" \
        --headless \
        --users "$USERS" \
        --spawn-rate "$RATE" \
        --run-time "$TIME" \
        --host "$HOST"

else
    echo "Invalid option selected."
    exit 1
fi
