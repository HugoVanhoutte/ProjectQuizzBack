require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express")
const app = express();
app.use(bodyParser.json());
const cors = require('cors');
app.use(cors());
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
          title: 'API Quiz',
          version: '0.0.1',
          description: 'Description de zinzin',
          contact: {
              name: 'Hugo'
          },
            servers: [
                { rl: 'http://localhost:3000' }
            ]
        }
    },
    apis: ['./routes/*.js']
}

const swaggerDoc = swaggerJsDoc(swaggerOptions)
app.use("/api-doc", swaggerUI.serve, swaggerUI.setup(swaggerDoc))



const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

const quizzRoutes = require('./routes/quizz');
app.use('/api/quizz', quizzRoutes)

const port = process.env.PORT || 3333;
app.listen(port, () => {
    console.log('Server Started on port: ' + port);
})

//node server.js