require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
const cors = require('cors');
app.use(cors());

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

const port = process.env.PORT || 3333;
app.listen(port, () => {
    console.log('Server Started on port: ' + port);
})

//node server.js