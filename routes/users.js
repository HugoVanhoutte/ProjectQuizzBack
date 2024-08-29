const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('../config/db')


router.get('/', (req, res) => {
    const sql = "SELECT * FROM users"
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).send(err)
        }
        res.status(200).json(results)
    });
});



router.post('/register', async (req, res) => {
    const {username, password, validatePassword} = req.body
    if (!username || !password || !validatePassword) {
        return res.status(400).send({"message": "error in form"})
    }
    if (password !== validatePassword) {
        return res.status(400).send({"message": "Passwords do not match"})
    }
        const hashedPassword = await bcrypt.hash(password, 12)

        const sql = 'INSERT INTO users (username, password) VALUES (?, ?)'
        db.query(sql, [username, hashedPassword], (err) => {
            if (err) {
                return res.status(500).send(err)
            }
            res.status(201).send({"message": "User added to DB"})
        });
});



router.post('/login', async (req, res) => {
    const {username, password} = req.body

    const sql = 'SELECT * FROM users WHERE username = ?'
    db.query(sql, [username], async (err, results) => {
        if (err) {
            return res.status(500).send(err)
        }

        if ((!results[0])) {
            return res.status(401).send({"message": "No such username"})
        } else if (!await bcrypt.compare(password, results[0].password)) {
            return res.status(401).send({"message": "Wrong password"})
        }

        const token = jwt.sign({"username": `${results[0].username}`}, process.env.JWT_SECRET, {"subject": "authentification"})
        res.status(200).send(`{"token":"${token}"}`)
    });
});

module.exports = router