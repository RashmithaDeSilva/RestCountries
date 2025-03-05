import express from 'express';
import dotenv from 'dotenv';
import { setupSwagger } from './swagger.mjs';
import router from './src/routers/Router.mjs';
import pool from './src/database/SQLCon.mjs';

// Setup express app
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
const API_VERSION = process.env.API_VERSION || 'v0';

// Swagger setup
if (process.env.ENV === "DEV") {
    setupSwagger(app);
}

// Middleware
app.use(express.json());
app.use(`/api/${ API_VERSION }/`, router);

app.listen(PORT, ()=>{
    console.log(`[INFO] - Server is running on http://localhost:${ PORT }`);
    if (process.env.ENV === "DEV") {
        console.log(`[INFO] - Swagger doc available on http://localhost:${ PORT }/api/${ API_VERSION }/api-docs`);
    }
});

