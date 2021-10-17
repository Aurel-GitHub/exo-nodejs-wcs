const connection = require("../../db-config");
const Joi = require('joi');
const db = connection.promise();

const validate = (data, forCreation = true) => {
    const presence = forCreation ? 'required' : 'optional';
    return Joi.object({
        title: Joi.string().max(255).presence(presence),
        director: Joi.string().max(255).required().presence(presence),
        year: Joi.number().integer().min(1888).required().presence(presence),
        color: Joi.bool().required().presence(presence),
        nbEpisodes: Joi.number().integer().min(1).required().presence(presence),
        nbSeasons: Joi.number().integer().min(1).required().presence(presence),
    }).validate(data, { abortEarly: false}).error;
}; 

const findMany = ({filters: {year, color}}) => {
    let sql = "SELECT * FROM series";
    const sqlValues = [];
    if (year) {
      sql += " WHERE year = ?";
      sqlValues.push(year);
    } else if (color) {
      sql += " WHERE color = ?";
      sqlValues.push(color);
    } 
    return db.query(sql, sqlValues).then(([results]) => results); 
};

const findOne = (id) => { 
    return db
        .query('SELECT * FROM series WHERE id = ?', [id])
        .then(([results]) => results[0]);
};

const create = ({ title, director, year, color, nbEpisodes, nbSeasons }) => {
    return db
        .query(
            'INSERT INTO series(title, director, year, color, nbEpisodes, nbSeasons) VALUES (?, ?, ?, ?, ?, ?)',
            [title, director, year, color, nbEpisodes, nbSeasons]
        )
        .then(([results]) => {
            const id = results.insertId;
            return { title, director, year, color, nbEpisodes, nbSeasons };
        });
};

const update = (id, newAttributes) =>  {
    return db.query('UPDATE series SET ? WHERE id = ?', [newAttributes, id ]);
};

const destroy = (id) => {
    return db
        .query('DELETE FROM series WHERE id = ?', [id])
        .then(([result]) => result.affectedRows !== 0);
};

module.exports = { validate, findMany, findOne, create, update, destroy };