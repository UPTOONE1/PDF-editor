#!/bin/bash

# Simple script to start the PDF editor web app

echo "========================================="
echo "  Free PDF Editor - Starting Server"
echo "========================================="
echo ""

cd webapp

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "Starting server on http://localhost:8000"
    echo "Press Ctrl+C to stop the server"
    echo ""
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "Starting server on http://localhost:8000"
    echo "Press Ctrl+C to stop the server"
    echo ""
    python -m http.server 8000
else
    echo "Error: Python not found"
    echo "Please install Python or open webapp/index.html directly in your browser"
    exit 1
fi
