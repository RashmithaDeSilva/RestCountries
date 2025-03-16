import express from 'express';
import dotenv from 'dotenv';
import { setupSwagger } from './src/utils/swagger.mjs';
import session from 'express-session';
import router from './src/routers/Router.mjs';
import passport from 'passport';
import './src/strategies/local-strategy.mjs';
import redisSessionStore from './src/stores/SessionStore.mjs';

// Setup express app
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
const API_VERSION = process.env.API_VERSION || 'v1';
const ENV = process.env.ENV || 'DEV';

// Swagger setup
if (ENV === "DEV") {
    setupSwagger(app);
}

// Session setup
app.use(session({
    store: redisSessionStore,
    secret: process.env.SESSION_SECRET || 'wVI7efbx+CV43xplx4!H$a&lUAX2H6jJ)Gb&0NJy$%)V%TNAPaUF=5yHeZ6Sz!I@',
    saveUninitialized: false, // recommended: only save session when data exists
    resave: true, // required: force lightweight session keep alive (touch)
    cookie: {
        maxAge: Number(process.env.COOKIE_EX_TIME || 86400) * 1000,
        httpOnly: true, // Cookie is not accessible via JavaScript
        // secure: ENV === 'PROD', // Only send cookie over HTTPS in production
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

