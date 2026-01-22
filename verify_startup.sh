#!/bin/bash
echo "=========================================="
echo "STAYMATE STRICT MYSQL STARTUP CHECK"
echo "=========================================="

DB_DIR="server/src/main/resources/db/migration"
V113="$DB_DIR/V113__seed_earnings_data.sql"
V114="$DB_DIR/V114__payout_method_verification.sql"

# 1. Check V113 for strict MySQL compatibility
echo "checking V113..."
if grep -q "PREPARE stmt FROM @sql" "$V113"; then
    echo "✅ V113 uses Prepared Statements (Idempotent)"
else
    echo "❌ V113 does not use Prepared Statements"
    exit 1
fi
if grep -q "IF NOT EXISTS.*ADD COLUMN" "$V113"; then
    echo "❌ V113 contains banned 'IF NOT EXISTS' for columns"
    exit 1
fi

# 2. Check V114
echo "checking V114..."
if grep -q "PREPARE stmt FROM @sql" "$V114"; then
    echo "✅ V114 uses Prepared Statements (Idempotent)"
else
    echo "❌ V114 does not use Prepared Statements"
    exit 1
fi
if grep -q "IF NOT EXISTS.*ADD COLUMN" "$V114"; then
    echo "❌ V114 contains banned 'IF NOT EXISTS' for columns"
    exit 1
fi

# 3. Check application.properties
echo "checking properties..."
PROP_FILE="server/src/main/resources/application.properties"
if grep -q "spring.jpa.hibernate.ddl-auto=validate" "$PROP_FILE"; then
    echo "✅ JPA ddl-auto is set to 'validate'"
else
    echo "❌ JPA ddl-auto is NOT set to 'validate'"
    exit 1
fi

echo "=========================================="
echo "STRICT COMPATIBILITY CHECK PASSED"
echo "You can now run: mvn clean spring-boot:run"
echo "=========================================="
