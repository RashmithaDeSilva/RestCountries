#!/bin/bash

cd backend
# Install necessary dependencies
npm install

# Check for the environment argument
ENV=$1

# Default to 'dev' if no argument is provided
if [ -z "$ENV" ]; then
  ENV="dev"
fi

# Run the corresponding script based on the environment
echo "Starting application in $ENV mode..."
case "$ENV" in
  "dev")
    npm run dev
    ;;
  "prod")
    npm run start
    ;;
  "test")
    npm run test
    ;;
  *)
    echo "Invalid environment. Use 'dev', 'prod', or 'test'."
    exit 1
    ;;
esac
