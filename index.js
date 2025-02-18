import express from 'express';
import dotenv from 'dotenv';

// Setup express app with port configs
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// Run app
app.use(express.json());
app.listen(PORT, ()=>{
    console.log(`[INFO] - Server is running on port ${PORT}`);
});

