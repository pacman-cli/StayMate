#!/bin/bash
# Serve MkDocs from the project root

# Ensure we are in the script's directory (Project Root)
cd "$(dirname "$0")"

echo "🚀 Starting StayMate Documentation Server..."
echo "📂 Root: $(pwd)"
echo "📄 Config: mkdocs.yml"

# check if mkdocs is installed associated with python3
if ! python3 -m mkdocs --version &> /dev/null; then
    echo "❌ MkDocs not found. Installing..."
    pip install mkdocs-material
fi

# Serve
python3 -m mkdocs serve
