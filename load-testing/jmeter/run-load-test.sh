#!/bin/bash

# StayMate Load Test Runner
# Production-ready script for running JMeter load tests

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
JMETER_PLAN="${SCRIPT_DIR}/staymate-load-test.jmx"
RESULTS_DIR="${SCRIPT_DIR}/../results"
REPORTS_DIR="${SCRIPT_DIR}/../reports"

# Default values
BASE_URL=${BASE_URL:-localhost}
PORT=${PORT:-8080}
PROTOCOL=${PROTOCOL:-http}
TENANT_USERS=${TENANT_USERS:-30}
LANDLORD_USERS=${LANDLORD_USERS:-15}
ADMIN_USERS=${ADMIN_USERS:-5}
TEST_DURATION=${TEST_DURATION:-300}
TENANT_RAMPUP=${TENANT_RAMPUP:-30}
LANDLORD_RAMPUP=${LANDLORD_RAMPUP:-30}
ADMIN_RAMPUP=${ADMIN_RAMPUP:-30}

# Create directories
mkdir -p "$RESULTS_DIR" "$REPORTS_DIR"

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RESULTS_FILE="${RESULTS_DIR}/load-test-results-${TIMESTAMP}.jtl"
REPORT_DIR="${REPORTS_DIR}/load-test-report-${TIMESTAMP}"
LOG_FILE="${RESULTS_DIR}/load-test-${TIMESTAMP}.log"

# Function to check if JMeter is installed
check_jmeter() {
    if ! command -v jmeter &> /dev/null; then
        echo "❌ JMeter is not installed or not in PATH"
        echo "Please install JMeter:"
        echo "  macOS: brew install jmeter"
        echo "  Ubuntu: sudo apt install jmeter"
        echo "  Windows: Download from https://jmeter.apache.org/"
        exit 1
    fi
}

# Function to test application connectivity
test_connectivity() {
    echo "🔍 Testing application connectivity..."

    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -f -s --max-time 10 "${PROTOCOL}://${BASE_URL}:${PORT}/actuator/health" > /dev/null 2>&1; then
            echo "✅ Application is healthy and accessible"
            return 0
        fi

        echo "⏳ Attempt $attempt/$max_attempts: Application not ready, waiting 10 seconds..."
        sleep 10
        ((attempt++))
    done

    echo "❌ Application is not accessible after ${max_attempts} attempts"
    echo "Please ensure the application is running at ${PROTOCOL}://${BASE_URL}:${PORT}"
    exit 1
}

# Function to validate test data
validate_test_data() {
    echo "🔍 Validating test data..."

    local csv_files=(
        "${SCRIPT_DIR}/data/tenants.csv"
        "${SCRIPT_DIR}/data/landlords.csv"
        "${SCRIPT_DIR}/data/admin.csv"
    )

    for csv_file in "${csv_files[@]}"; do
        if [ ! -f "$csv_file" ]; then
            echo "❌ CSV file not found: $csv_file"
            exit 1
        fi

        # Check if CSV has data (excluding header)
        local data_lines=$(tail -n +2 "$csv_file" | wc -l)
        if [ "$data_lines" -eq 0 ]; then
            echo "❌ CSV file has no data: $csv_file"
            exit 1
        fi

        echo "✅ CSV file validated: $csv_file ($data_lines data rows)"
    done
}

# Function to display test configuration
display_config() {
    echo "🚀 StayMate Load Test Configuration"
    echo "=================================="
    echo "Target: ${PROTOCOL}://${BASE_URL}:${PORT}"
    echo "Duration: ${TEST_DURATION} seconds"
    echo ""
    echo "User Distribution:"
    echo "  Tenants: ${TENANT_USERS} users (ramp-up: ${TENANT_RAMPUP}s)"
    echo "  Landlords: ${LANDLORD_USERS} users (ramp-up: ${LANDLORD_RAMPUP}s)"
    echo "  Admins: ${ADMIN_USERS} users (ramp-up: ${ADMIN_RAMPUP}s)"
    echo "  Total: $((TENANT_USERS + LANDLORD_USERS + ADMIN_USERS)) concurrent users"
    echo ""
    echo "Results: ${RESULTS_FILE}"
    echo "Report: ${REPORT_DIR}/index.html"
    echo "Log: ${LOG_FILE}"
    echo ""
}

# Function to run the load test
run_test() {
    echo "🏃 Starting load test..."

    local jmeter_args=(
        "-n"  # Non-GUI mode
        "-t" "$JMETER_PLAN"
        "-JBASE_URL=$BASE_URL"
        "-JPORT=$PORT"
        "-JPROTOCOL=$PROTOCOL"
        "-JTENANT_USERS=$TENANT_USERS"
        "-JLANDLORD_USERS=$LANDLORD_USERS"
        "-JADMIN_USERS=$ADMIN_USERS"
        "-JTEST_DURATION=$TEST_DURATION"
        "-JTENANT_RAMPUP=$TENANT_RAMPUP"
        "-JLANDLORD_RAMPUP=$LANDLORD_RAMPUP"
        "-JADMIN_RAMPUP=$ADMIN_RAMPUP"
        "-l" "$RESULTS_FILE"
        "-o" "$REPORT_DIR"
        "-j" "$LOG_FILE"
    )

    echo "Command: jmeter ${jmeter_args[*]}"
    echo ""

    if jmeter "${jmeter_args[@]}"; then
        echo "✅ Load test completed successfully"
        return 0
    else
        echo "❌ Load test failed"
        return 1
    fi
}

# Function to analyze results
analyze_results() {
    echo "📊 Analyzing test results..."

    if [ ! -f "$RESULTS_FILE" ]; then
        echo "❌ Results file not found: $RESULTS_FILE"
        return 1
    fi

    # Extract key metrics
    local total_samples=$(wc -l < "$RESULTS_FILE")
    local errors=$(grep '"success":false' "$RESULTS_FILE" | wc -l)
    local error_rate=$(echo "scale=2; $errors * 100 / $total_samples" | bc -l 2>/dev/null || echo "0")

    echo "📈 Test Summary:"
    echo "  Total Samples: $total_samples"
    echo "  Errors: $errors"
    echo "  Error Rate: ${error_rate}%"

    # Check if HTML report was generated
    if [ -f "$REPORT_DIR/index.html" ]; then
        echo "✅ HTML report generated: $REPORT_DIR/index.html"

        # Try to open the report (macOS only)
        if command -v open &> /dev/null; then
            echo "🌐 Opening HTML report..."
            open "$REPORT_DIR/index.html"
        fi
    else
        echo "⚠️  HTML report not found"
    fi

    # Performance thresholds
    local max_error_rate=5.0
    if (( $(echo "$error_rate > $max_error_rate" | bc -l) )); then
        echo "🚨 HIGH ERROR RATE: ${error_rate}% (threshold: ${max_error_rate}%)"
        return 1
    fi

    return 0
}

# Function to cleanup old results
cleanup_old_results() {
    echo "🧹 Cleaning up old results (keeping last 5)..."

    # Remove old result files (keep last 5)
    find "$RESULTS_DIR" -name "load-test-results-*.jtl" -type f | sort -r | tail -n +6 | xargs -r rm -f
    find "$RESULTS_DIR" -name "load-test-*.log" -type f | sort -r | tail -n +6 | xargs -r rm -f

    # Remove old report directories (keep last 5)
    find "$REPORTS_DIR" -name "load-test-report-*" -type d | sort -r | tail -n +6 | xargs -r rm -rf
}

# Main execution
main() {
    echo "🧪 StayMate Load Test Runner"
    echo "============================"
    echo ""

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --base-url)
                BASE_URL="$2"
                shift 2
                ;;
            --port)
                PORT="$2"
                shift 2
                ;;
            --protocol)
                PROTOCOL="$2"
                shift 2
                ;;
            --duration)
                TEST_DURATION="$2"
                shift 2
                ;;
            --tenant-users)
                TENANT_USERS="$2"
                shift 2
                ;;
            --landlord-users)
                LANDLORD_USERS="$2"
                shift 2
                ;;
            --admin-users)
                ADMIN_USERS="$2"
                shift 2
                ;;
            --cleanup)
                cleanup_old_results
                exit 0
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --base-url URL        Target base URL (default: localhost)"
                echo "  --port PORT           Target port (default: 8080)"
                echo "  --protocol PROTOCOL   Protocol http/https (default: http)"
                echo "  --duration SECONDS    Test duration in seconds (default: 300)"
                echo "  --tenant-users NUM    Number of tenant users (default: 30)"
                echo "  --landlord-users NUM  Number of landlord users (default: 15)"
                echo "  --admin-users NUM     Number of admin users (default: 5)"
                echo "  --cleanup             Clean up old results and exit"
                echo "  --help                Show this help message"
                echo ""
                echo "Environment Variables:"
                echo "  BASE_URL, PORT, PROTOCOL, TEST_DURATION"
                echo "  TENANT_USERS, LANDLORD_USERS, ADMIN_USERS"
                exit 0
                ;;
            *)
                echo "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done

    # Execute test pipeline
    check_jmeter
    validate_test_data
    display_config
    test_connectivity

    if run_test; then
        analyze_results
        echo ""
        echo "🎉 Load test completed successfully!"
        echo "📊 View detailed report: $REPORT_DIR/index.html"
    else
        echo ""
        echo "❌ Load test failed. Check log file: $LOG_FILE"
        exit 1
    fi
}

# Run main function with all arguments
main "$@"
