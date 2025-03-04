FROM node:23-alpine3.20

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY index.mjs .
COPY src ./src

# Expose port 3001
EXPOSE 3001

# Start the application
CMD ["npm", "run", "start"]
