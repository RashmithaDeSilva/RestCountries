#!/bin/bash

# Function to stop and remove only cw1_container
cleanup_container() {
    if docker ps -a --format '{{.Names}}' | grep -q "^cw1_container$"; then
        echo "Stopping and removing existing container..."
        docker stop cw1_container
        docker rm cw1_container
    fi
}

# Function to remove only cw1_image
cleanup_image() {
    if [[ -n $(docker images -q cw1_image) ]]; then
        echo "Removing old image..."
        docker rmi cw1_image
    fi
}

# If --stop flag is provided, only clean up and exit
if [[ "$1" == "--stop" ]]; then
    cleanup_container
    cleanup_image
    echo "cw1_container and cw1_image removed."
    exit 0
fi

# Default behavior: remove old cw1_container and cw1_image, then rebuild and run
cleanup_container
cleanup_image

# Build the new Docker image
echo "Building new Docker image..."
docker build -t cw1_image ./backend

# Run the new container
echo "Running new container..."
docker run -itd --name cw1_container -p 6001:3001 cw1_image

echo "Container is up and running!"
