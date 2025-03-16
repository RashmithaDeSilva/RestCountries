# 6COSC022C.2 CW 1 Secure API Middleware Service 

## Overview

This project implements a secure API middleware service that interfaces with [RestCountries.com](https://restcountries.com), a RESTful service providing detailed information about countries worldwide. The application serves as an intermediary layer, processing and filtering country data while enforcing robust security measures.

### Key Features:
- **API Integration**: Retrieve country data (name, currency, capital, languages, flag) from RestCountries.
- **Authentication**: Complete user management system with registration, login, password hashing, and session management.
- **API Key Management**: Users can generate and manage API keys.
- **Security**: The system includes comprehensive security practices, including input validation, password hashing, and session management.
- **Containerization**: The application is fully containerized using Docker for seamless deployment.

## Project Scope

The application retrieves data from [RestCountries API](https://restcountries.com) and exposes the following country information:
- Country Name
- Currency Information
- Capital City
- Spoken Languages
- National Flag

It supports user registration, login capabilities, and API key management with secure data storage in an SQLite database. The system implements robust security measures, including password hashing, session management, and API key validation.

## Technologies Used

- **Backend**: Express (Node.js) with ECMAScript Modules (`.mjs` format)
- **Database**: MySQL (Production), SQLite (Development)
- **Caching**: Redis (Session and Cache storage)
- **Containerization**: Docker
- **API Documentation**: Swagger
- **Authentication**: Passport JS

## Setup Instructions

### Prerequisites
- Node.js (v14 or later)
- Docker
- MySQL (for production environment)
- Redis (for session and cache storage)

### 1. Clone the Repository

```bash
git clone https://github.com/RashmithaDeSilva/6COSC022C.2_CW1.git
cd 6COSC022C.2_CW1
```

### 2. Run Application

Run the following command to run the aplication:

```bash
# Windows
double click run.bat

# Linux
sh run.sh dev
sh run.sh prod
sh run.sh test
```

### 3. Docker Setup

To run the application using Docker, build and run the containers:

```bash
docker-compose up -d
```

This command will build the Docker images for all services and start the containers. It will set up the application, Redis, MySQL (for production), and SQLite (for development).

### 4. Database Configuration

- For development, SQLite is used automatically.
- For production, MySQL should be set up. Update the `.env` file with your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=yourusername
DB_PASSWORD=yourpassword
DB_NAME=yourdb
```

### 5. API Documentation

Swagger is set up for API documentation. Once the app is running, access the Swagger UI at (only works on DEV env):

```bash
http://localhost:3001/api/v1/api-docs
```

### 6. Accessing the API

- **User Registration**: `POST /api/v1/auth/register`
- **User Login**: `POST /api/v1/auth/login`
- **Generate API Key**: `PATCH /api/v1/auth/user/apikey/generatenewkey`
- **Get Country Info**: `GET /api/v1/auth/restcountry`

### 7. Running Locally

To run the application locally without Docker, ensure your dependencies are installed and configure your database settings in the `.env` file. Then, run the application:

```bash
npm start
```

## Security Measures

- **Password Hashing**: All user passwords are securely hashed using bcrypt.
- **Session Management**: Redis is used to store user sessions, ensuring secure access control.
- **API Key Validation**: All API endpoints require a valid API key for access.
- **Input Validation**: All input is sanitized to prevent injection attacks and other vulnerabilities.
