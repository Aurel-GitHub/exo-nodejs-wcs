const connection = require("../../db-config");
const argon2 = require('argon2');
const Joi = require('joi');
const db = connection.promise();

const hashingOptions = {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 5,
    parallelism: 1
};

const hashPassword = (plainPassword) => {
    return argon2.hash(plainPassword, hashingOptions);
};

const verifyPassword = (plainPassword, hashedPassword) => {
    return argon2.verify(hashedPassword, plainPassword, hashingOptions);
};
  
const validate = (data, forCreation = true) => {
    const presence = forCreation ? 'required' : 'optional';
    return Joi.object({
        email: Joi.string().email().max(255).required().presence(presence),
        firstname: Joi.string().max(255).required().presence(presence),
        lastname: Joi.string().max(255).required().presence(presence), 
    }).validate(data, { abortEarly: false}).error;
};

const findMany = () => {
    let sql = "SELECT firstname,lastname, email FROM users";
    const sqlValues = [];
    if (firstname) {
        sql += "WHERE firstname = ?";
        sqlValues.push(firstname);
    } else if (lastname) {
        sql += "WHERE lastname = ?";
        sqlValues.push(lastname);
    } else if (email) {
        sql += "WHERE email = ?";
        sqlValues.push(email);
    }
    return db.query(sql.sqlValues).then(([results]) => results);
}

const findOne = (id) => {
    return db
        .query('SELECT firstname, lastname, email FROM users WHERE id = ?', [id])
        .then(([results]) => { results[0]});
};

const create = ({ firstname, lastname, email, password }) => {
    return db
        .query(
            'INSERT INTO users(firstname, lastname, email, password) VALUES (?, ?, ?)',
            [firstname, lastname, email, password]
        )
        .then(([results]) => {
            const id = results.insertId;
            return { firstname, lastname, email };
        })
};

const update = (id, newAttributes) => {
    return db.query('UPDATE users set ? WHERE id = ?', [newAttributes, id]);
};

const destroy = (id) => {
    return db   
        .query('DELETE FROM users WHERE id = ?', [id])
        .then(([result]) => result.affectedRows !== 0);
};

module.exports = { validate, findMany, findOne, create, update, destroy, hashPassword, verifyPassword };