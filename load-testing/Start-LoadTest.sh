#!/bin/bash
# Wrapper script to launch StayMate Load Tests from the root load-testing dir

# Ensure executable
chmod +x jmeter/run-load-test.sh

# Run the inner script
echo "🚀 Launching StayMate Load Test..."
./jmeter/run-load-test.sh "$@"
