const db = require('./db');

const dbQuery = (query, params) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result)
        })
    })
}
module.exports = dbQuery