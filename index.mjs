import express from 'express';
import dotenv from 'dotenv';
import router from './src/routers/Router.mjs';
import pool from './src/database/SQLCon.mjs';

// Setup express app with port configs
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
const API_VERSION = process.env.VERSION || 'v0';

// Middleware
app.use(express.json());
app.use(`/api/${ API_VERSION }/`, router);

app.listen(PORT, ()=>{
    console.log(`[INFO] - Server is running on port ${ PORT }`);
});

