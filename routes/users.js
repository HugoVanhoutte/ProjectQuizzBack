const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const dbQuery = require("../config/dbQuery");


/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupérer tous les utilisateurs
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 25
 *                   username:
 *                     type: string
 *                     example: "Toto"
 */

router.get('/', async (req, res) => {
    const sql = "SELECT * FROM users"
    const results = await dbQuery(sql)
    res.status(200).json(results)
})


/**
 * @swagger
 * /api/users/register:
 *    post:
 *      summary: Register a new user
 *      description: This endpoint allows a new user to register by providing a username and password.
 *      tags: [Users]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                username:
 *                  type: string
 *                  example: johndoe
 *                password:
 *                  type: string
 *                  example: secretpassword
 *                validatePassword:
 *                  type: string
 *                  example: secretpassword
 *      responses:
 *        201:
 *          description: User successfully registered
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: User added to DB
 *        400:
 *          description: Error in form or passwords do not match
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Passwords do not match
 *        500:
 *          description: Internal server error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: "Database error message"
 */
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
        await dbQuery(sql, [username, hashedPassword])
        res.status(201).send({"message": "User added to DB"})
});


/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Log in a user
 *     description: This endpoint allows a user to log in by providing a username and password.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: secretpassword
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Unauthorized - Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No such username"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Database error message"
 */
router.post('/login', async (req, res) => {
    const {username, password} = req.body

    const sql = 'SELECT * FROM users WHERE username = ?'
    const results = await dbQuery(sql, [username])
        if ((!results[0])) {
            return res.status(401).send({"message": "No such username"})
        } else if (!await bcrypt.compare(password, results[0].password)) {
            return res.status(401).send({"message": "Wrong password"})
        }

        const token = jwt.sign({"id": `${results[0].id}`, "username": `${results[0].username}`, "role": `${results[0].role}`}, process.env.JWT_SECRET, {"subject": "authentification"})
        res.status(200).send(`{"token":"${token}"}`)
});

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Log in a user
 *     description: This endpoint allows a user to log in by providing a username and password.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: secretpassword
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Unauthorized - Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No such username"  # or "Wrong password"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Database error message"
 */
router.get('/:id', async (req, res) => {
    const sql = "SELECT * FROM users WHERE id = ?"
    const results = await dbQuery(sql, [req.params.id])
        res.status(200).json(results[0])
})

module.exports = router