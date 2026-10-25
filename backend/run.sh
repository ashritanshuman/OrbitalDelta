#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

VENV_DIR="$SCRIPT_DIR/.venv"

if [ ! -d "$VENV_DIR" ]; then
    echo "Creating Python virtual environment in $VENV_DIR..."
    if command -v python3.12 >/dev/null 2>&1; then
        PYTHON_BIN=python3.12
    elif command -v python3.11 >/dev/null 2>&1; then
        PYTHON_BIN=python3.11
    else
        PYTHON_BIN=python3
    fi
    $PYTHON_BIN -m venv "$VENV_DIR"
fi

# Activate virtual environment
source "$VENV_DIR/bin/activate"

# Ensure pip is up to date and dependencies are installed
echo "Verifying backend dependencies..."
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

# Determine port (default to 8000, fallback to 8002 if 8000 is occupied by system service)
PORT="${PORT:-8000}"
if ss -tlpn "( sport = :$PORT )" 2>/dev/null | grep -q ":$PORT"; then
    if [ "$PORT" = "8000" ]; then
        echo "Note: Port 8000 is currently occupied. Selecting port 8002..."
        PORT=8002
    fi
fi

# Start uvicorn server
echo "Starting ORBITAL DELTA FastAPI server on http://0.0.0.0:$PORT..."
exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --reload
