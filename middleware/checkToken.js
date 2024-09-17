const jwt = require("jsonwebtoken");
const checkToken = async (userSubmittedToken) => {
    if (userSubmittedToken === process.env.ADMIN_TOKEN) { //TODO: supprimer
        return {
            "id": 1,
            "role": "admin",
            "username": "admin"
        }
    }
    return new Promise((resolve, reject) => {
        jwt.verify(userSubmittedToken, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return reject(err);
            }
            resolve(decoded)
        })
    })
}

module.exports = checkToken;
