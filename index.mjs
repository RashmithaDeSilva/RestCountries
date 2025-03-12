import express from 'express';
import dotenv from 'dotenv';
import { setupSwagger } from './swagger.mjs';
import session from 'express-session';
import router from './src/routers/Router.mjs';
import passport from 'passport';
import './src/strategies/local-strategy.mjs';
import cookieParser from 'cookie-parser';

// Setup express app
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
const API_VERSION = process.env.API_VERSION || 'v0';
const ENV = process.env.ENV || 'DEV';

// Swagger setup
if (ENV === "DEV") {
    setupSwagger(app);
}

// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: Number(process.env.COOKIE_EX_TIME),
    },
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(express.json());

// Routers setup
app.use(`/api/${ API_VERSION }/`, router);

app.listen(PORT, ()=>{
    console.log(`[INFO] - Server is running on http://localhost:${ PORT }`);
    if (ENV === "DEV") {
        console.log(`[INFO] - Swagger doc available on http://localhost:${ PORT }/api/${ API_VERSION }/api-docs`);
    }
});

