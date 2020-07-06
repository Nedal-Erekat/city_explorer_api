'use strict';
//dependensies
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const PORT = process.env.PORT || 3030;
const app = express();
app.use(cors());//anyone can touch my server
app.listen(PORT, () => {
    console.log(`port ${PORT}`);
});
