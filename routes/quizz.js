const express = require('express');
const router = express.Router();
const checkToken = require('../middleware/getUserFromToken');
const dbQuery = require('../config/dbQuery');


/**
 * @swagger
 * /api/quizz:
 *   get:
 *     summary: Récupérer tous les quizz
 *     tags: [Quizz]
 *     responses:
 *       200:
 *         description: Liste des quizz
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 52
 *                   title:
 *                     type: string
 *                     example: "quizz numéro 52"
 *                   description:
 *                     type: string
 *                     example: "Un super quiz"
 *                   creator_id:
 *                     type: integer
 *                     example: 25
 *                   created_at:
 *                     type: integer
 *                     example: 546161
 */
router.get('/', async (req, res) => {
    const sql = "SELECT * FROM quizz";
    try {
        const results = await dbQuery(sql)
        res.status(200).json(results);
    } catch (err) {
        res.status(500).send(err)
    }
});


/**
 * @swagger
 * /{id}:
 *   get:
 *     summary: Get a quiz by ID with questions, answers, and the correct answer
 *     description: Retrieves a quiz along with its associated questions, answers, and identifies the correct answer by the quiz ID.
 *     tags:
 *       - Quizz
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the quiz to retrieve
 *     responses:
 *       200:
 *         description: Quiz retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                   description: Unique ID of the quiz
 *                 title:
 *                   type: string
 *                   example: "Science Quiz"
 *                   description: Title of the quiz
 *                 description:
 *                   type: string
 *                   example: "A quiz on various science topics."
 *                   description: Description of the quiz
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 101
 *                         description: Unique ID of the question
 *                       question:
 *                         type: string
 *                         example: "What is the chemical symbol for water?"
 *                         description: The quiz question
 *                       correct_answer:
 *                         type: integer
 *                         example: 1
 *                         description: The index of the correct answer in the answers array
 *                       answers:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 201
 *                               description: Unique ID of the answer
 *                             answer:
 *                               type: string
 *                               example: "H2O"
 *                               description: The possible answer
 *       404:
 *         description: Quiz not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Quiz not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 */

router.get('/:id', async (req, res) => {
    const sqlQuiz = "SELECT * FROM quizz WHERE id = ?"
    const quizResults = await dbQuery(sqlQuiz, req.params.id)
    const quiz = {
        id: quizResults[0].id,
        title: quizResults[0].title,
        description: quizResults[0].description,
        questions: []
    }
    const sqlQuestion = "SELECT * FROM questions WHERE quiz_id = ?"
    const questionResults = await dbQuery(sqlQuestion, req.params.id)
    for (const questionResult of questionResults) {
        const questionIndex = questionResults.indexOf(questionResult);
        quiz.questions.push({
            id: questionResult.id,
            question: questionResult.text,
            correct_answer: 0,
            answers: []
        })
        const sqlAnswer = "SELECT * FROM answers WHERE question_id = ?"
        const answerResults = await dbQuery(sqlAnswer, questionResult.id)

        answerResults.forEach((answerResult, answerIndex) => {
            quiz.questions[questionIndex].answers.push({id: answerResult.id, answer: answerResult.text});
            if (answerResult.is_correct === 1) {
                quiz.questions[questionIndex].correct_answer = answerIndex;
            }
        })
    }
    res.status(200).json(quiz)
})

/**
 * @swagger
 * /take/{id}:
 *   get:
 *     summary: Get a quiz by ID with questions and answers (for students)
 *     description: Retrieves a quiz along with its associated questions and answers by the quiz ID (for students).
 *     tags:
 *       - Quizz
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the quiz to retrieve
 *     responses:
 *       200:
 *         description: Quiz retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                   description: Unique ID of the quiz
 *                 title:
 *                   type: string
 *                   example: "General Knowledge Quiz"
 *                   description: Title of the quiz
 *                 description:
 *                   type: string
 *                   example: "A quiz on general knowledge."
 *                   description: Description of the quiz
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 101
 *                         description: Unique ID of the question
 *                       question:
 *                         type: string
 *                         example: "What is the capital of France?"
 *                         description: The quiz question
 *                       answers:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 201
 *                               description: Unique ID of the answer
 *                             answer:
 *                               type: string
 *                               example: "Paris"
 *                               description: The possible answer
 *       404:
 *         description: Quiz not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Quiz not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 */

router.get('/take/:id', async (req, res) => {

    const sqlQuiz = "SELECT * FROM quizz WHERE id = ?"
    const quizResults = await dbQuery(sqlQuiz, req.params.id)

    const quiz = {
        id: quizResults[0].id,
        title: quizResults[0].title,
        description: quizResults[0].description,
        questions: []
    }
    const sqlQuestion = "SELECT * FROM questions WHERE quiz_id = ?"
    const questionResults = await dbQuery(sqlQuestion, req.params.id)
    for (const questionResult of questionResults) {
        const questionIndex = questionResults.indexOf(questionResult);
        quiz.questions.push({
            id: questionResult.id,
            question: questionResult.text,
            answers: []
        })
        const sqlAnswer = "SELECT * FROM answers WHERE question_id = ?"
        const answerResults = await dbQuery(sqlAnswer, questionResult.id)

        answerResults.forEach((answerResult, answerIndex) => {
            quiz.questions[questionIndex].answers.push({id: answerResult.id, answer: answerResult.text});
        })
    }
    res.status(200).json(quiz)
})

/**
 * @swagger
 * /api/quizz/new:
 *   post:
 *     summary: Créer un nouveau quiz
 *     tags: [Quizz]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quiz:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     example: "Mon Nouveau Quiz"
 *                   description:
 *                     type: string
 *                     example: "Ceci est un quiz de test."
 *                   questions:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         question:
 *                           type: string
 *                           example: "Quelle est la capitale de la France ?"
 *                         correct_answer:
 *                           type: integer
 *                           example: 0
 *                         answers:
 *                           type: array
 *                           items:
 *                             type: string
 *                             example:
 *                               - "Paris"
 *                               - "Londres"
 *                               - "Berlin"
 *                               - "Madrid"
 *     responses:
 *       201:
 *         description: Quiz et questions ajoutés à la base de données
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Quizz and questions added to DB"
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Database error message"
 *       403:
 *         description: Erreur de token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error (token)"
 */

router.post('/new', async (req, res) => {
    try {
        //Checks if user submitted token is ok (if ok, user id return, else error threw
        const user = await checkToken(req.body.token)
        if (!user) {
            throw 'User not found'
        }
        const quiz = req.body.quiz

        quiz.questions = quiz.questions.filter(question => question.question.trim() !== '')
        quiz.questions.forEach((question) => {
            question.answers = question.answers.filter(answer => answer.answer.trim() !== '')
        })

        const sqlQuiz = "INSERT INTO quizz (title, description, creator_id) VALUES (?, ?, ?)"
        let results = await dbQuery(sqlQuiz, [quiz.title, quiz.description, user.id])
        const quizId = results.insertId
        for (const question of quiz.questions) {
            const correctAnswer = Number(question.correct_answer)
            const sqlQuestion = "INSERT INTO questions (text, quiz_id) VALUES (?, ?)"
            const questionResults = await dbQuery(sqlQuestion, [question.question, quizId])
            const questionId = questionResults.insertId
            for (const answer of question.answers) {
                const index = question.answers.indexOf(answer);
                let sqlAnswer = "INSERT INTO answers (text, question_id, is_correct) VALUES (?, ?, ?)"
                await dbQuery(sqlAnswer, [answer.answer, questionId, index === correctAnswer ? 1 : 0])
            }
        }
        res.status(201).send({"message": "Quizz, questions and answers added to DB"})
    } catch (error) {
        console.error(error)
        res.status(403).send({"message": error.message});
    }
});

/**
 * @swagger
 * /delete/{id}:
 *   delete:
 *     summary: Delete a quiz by ID
 *     description: Deletes the quiz with the specified ID from the database.
 *     tags:
 *       - Quizz
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the quiz to delete
 *     responses:
 *       200:
 *         description: Quiz successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Quiz 1 deleted from DB"
 *       404:
 *         description: Quiz not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Quiz not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 */

router.delete('/delete/:id', async (req, res) => {
    try {
        const user = await checkToken(req.body.token)
        if (!user) {
            res.status(403).send({"message": "User not found"})
        }
        const sql = "DELETE FROM quizz WHERE id = ?"
        await dbQuery(sql, [req.params.id])
        res.status(200).send({"message": `Quiz ${req.params.id} deleted from DB`})
    } catch {

    }
})

/**
 * @swagger
 * /update:
 *   put:
 *     summary: Update an existing quiz
 *     description: Updates quiz details, questions, and answers. Inserts new questions and answers if they do not exist.
 *     tags:
 *       - Quizz
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quiz:
 *                 type: object
 *                 required:
 *                   - id
 *                   - title
 *                   - description
 *                   - questions
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                     description: The unique ID of the quiz to update
 *                   title:
 *                     type: string
 *                     example: "Updated Quiz Title"
 *                     description: Title of the quiz
 *                   description:
 *                     type: string
 *                     example: "Updated quiz description"
 *                     description: Short description of the quiz
 *                   questions:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: The ID of the question (if exists)
 *                         question:
 *                           type: string
 *                           example: "Updated question text"
 *                         correct_answer:
 *                           type: integer
 *                           description: Index of the correct answer in the answers array
 *                         answers:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 description: The ID of the answer (if exists)
 *                               answer:
 *                                 type: string
 *                                 example: "Answer text"
 *                               is_correct:
 *                                 type: boolean
 *                                 example: false
 *     responses:
 *       200:
 *         description: Quiz successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Quiz updated successfully."
 *       400:
 *         description: Bad request, validation error
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 */

router.put('/update', async (req, res) => {
    try {

        const user = await checkToken(req.body.token)
        if (!user) {
            res.status(403).send({"message": "User not found"})
        }

        let quiz = req.body.quiz
        //Not insert into DB if question === '' TODO: make this a function in middleware ?
        quiz.questions = quiz.questions.filter(question => question.question.trim() !== '')
        quiz.questions.forEach((question) => {
            question.answers = question.answers.filter(answer => answer.answer.trim() !== '')
        })

        const sqlQuiz = "UPDATE quizz SET title = ?, description = ? WHERE id = ?"
        //Update quiz info to DB
        await dbQuery(sqlQuiz, [quiz.title, quiz.description, quiz.id])

        //Loop on questions to update/insert into DB
        for (const question of quiz.questions) {
            //if question.id is set: question already exists in DB, update existing question
            if (question.id) {
                const sqlQuestion = "UPDATE questions SET text = ? WHERE id = ?"
                await dbQuery(sqlQuestion, [question.question, question.id])

                //else if question.id is not set: question does not exist, insert question in DB and update quiz object
            } else {
                const sqlQuestionInsert = "INSERT INTO questions (text, quiz_id) VALUES (?, ?)"
                const result = await dbQuery(sqlQuestionInsert, [question.question, quiz.id])
                question.id = result.insertId
            }

            //When exiting either branch of if/else: question.id is set, loop on linked answers
            for (const answer of question.answers) {
                const answerIndex = question.answers.indexOf(answer)
                //if answer.id is set: answer exists, update DB
                if (answer.id) {
                    const sqlAnswer = "UPDATE answers SET text = ?, is_correct = ? WHERE id = ?"
                    await dbQuery(sqlAnswer, [answer.answer, question.correct_answer === answerIndex ? 1 : 0, answer.id])
                    //else if answer.id is not set: answer does not exist, insert into DB
                } else {
                    const sqlAnswerInsert = "INSERT INTO answers (text, is_correct, question_id) VALUES (?, ?, ?)"
                    await dbQuery(sqlAnswerInsert, [answer.answer, question.correct_answer === answerIndex ? 1 : 0, question.id])
                }
            }
            //Get answers ids from DB but not in sent quiz object and removes them from DB
            const sqlAllAnswers = "SELECT id FROM answers WHERE question_id = ?"
            const resultsAllAnswers = await dbQuery(sqlAllAnswers, [question.id])
            const answersDB = resultsAllAnswers.map(answer => answer.id)
            const answersUser = question.answers.map(answer => answer.id)
            const toDeleteAnswers = answersDB.filter(answer => !answersUser.includes(answer))

            for (const answer of toDeleteAnswers) {
                const sqlDeleteAnswers = "DELETE FROM answers WHERE id = ?"
                await dbQuery(sqlDeleteAnswers, [answer])
            }

        }
        //Get questions ids from DB but not in sent quiz object and removes them from DB
        const sqlAllQuestions = "SELECT id FROM questions WHERE quiz_id = ?"
        const resultsAllQuestions = await dbQuery(sqlAllQuestions, [quiz.id])
        const questionsDB = resultsAllQuestions.map(question => question.id)
        const questionsUser = quiz.questions.map(question => question.id)
        const toDeleteQuestions = questionsDB.filter(question => !questionsUser.includes(question))

        for (const question of toDeleteQuestions) {
            const sqlDeleteQuestions = "DELETE FROM questions WHERE id = ?"
            await dbQuery(sqlDeleteQuestions, [question])
        }
        res.status(200).send({"message": "Quizz updated successfully."})
    } catch (error) {
        console.error(error)
        res.status(500).send({"message": error.message})
    }
})

module.exports = router;