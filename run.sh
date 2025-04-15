#!/bin/bash

# Configuration - Set your project paths here
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_PATH="$SCRIPT_DIR/frontend"
BACKEND_PATH="$SCRIPT_DIR/backend"

# Verify paths exist
if [ ! -d "$FRONTEND_PATH" ]; then
  echo "Error: Frontend path not found at $FRONTEND_PATH"
  exit 1
fi

if [ ! -d "$BACKEND_PATH" ]; then
  echo "Error: Backend path not found at $BACKEND_PATH"
  exit 1
fi

# Ask for environment
echo "Select environment:"
echo "1. Development (npm run dev)"
echo "2. Production (npm run start)"
read -p "Enter choice (1 or 2): " ENV_CHOICE

case $ENV_CHOICE in
  1)
    FRONTEND_CMD="npm run dev"
    BACKEND_CMD="npm run dev"
    ;;
  2)
    FRONTEND_CMD="npm run start"
    BACKEND_CMD="npm run start"
    ;;
  *)
    echo "Invalid choice, please try again"
    exit 1
    ;;
esac

# Update repositories
echo "Updating repositories..."
cd "$FRONTEND_PATH" && git pull
cd "$BACKEND_PATH" && git pull

# Run projects in separate terminal windows
echo "Starting projects..."

# For GNOME-based systems (Ubuntu, etc.)
gnome-terminal --tab --title="Frontend" -- bash -c "cd \"$FRONTEND_PATH\" && echo 'Installing frontend dependencies...' && npm install && echo 'Starting frontend...' && $FRONTEND_CMD; exec bash"
gnome-terminal --tab --title="Backend" -- bash -c "cd \"$BACKEND_PATH\" && echo 'Installing backend dependencies...' && npm install && echo 'Starting backend...' && $BACKEND_CMD; exec bash"

# Alternative for KDE Plasma:
# konsole --new-tab --hold -e "bash -c 'cd \"$FRONTEND_PATH\" && npm install && $FRONTEND_CMD'" &
# konsole --new-tab --hold -e "bash -c 'cd \"$BACKEND_PATH\" && npm install && $BACKEND_CMD'" &

# Alternative for systems without GNOME/KDE:
# xterm -hold -title "Frontend" -e "cd \"$FRONTEND_PATH\" && npm install && $FRONTEND_CMD" &
# xterm -hold -title "Backend" -e "cd \"$BACKEND_PATH\" && npm install && $BACKEND_CMD" &

echo "Both projects are starting in separate terminal windows..."