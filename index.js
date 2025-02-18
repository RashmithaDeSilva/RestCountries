const express = require('express');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.listen(PORT, ()=>{
    console.log(`[INFO] - Server is running on port ${PORT}`);
});

