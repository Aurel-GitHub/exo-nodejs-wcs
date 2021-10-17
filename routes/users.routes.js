const usersRouter = require('express').Router();
const Users = require('../models/users/users.model');

usersRouter.get('/', (req, res) => {
    Users.findMany({ filters: {firstname, lastname}})
        .then((users) => {
            res.json(users);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error retrieving users from database');
        });
});

usersRouter.get('/:id', (req, res) => {
    Users.findOne(req.params.id)
        .then((user) => {
            user ? res.json(user) : res.status(400).send('User not found')
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error retrieving user from database');
        });
});

usersRouter.post('/', (req, res) => {
    const error = Users.validate(req.body);
    error 
    ? res.status(422).json({validationErrors: error.details })
    : Users.create(req.body)
        .then((createUser) => {
            res.status(201).json(createUser);
        })
        .catch((err) => {
            console.log(err)
            res.status(500).send('Error saving the user');
        });
});

usersRouter.put(':/id', (req,res) => {
    let existingUser = null;
    let validationErrors = null;
    Users.findOne(req.params.id)
        .then((user) => {
            existingUser = user;
            if (!existingUser) return Promise.reject('RECORD_NOT_FOUND');
            validationErrors = Users.validate(req.body, false);
            if (existingUser) return Promise.reject('INVALID_DATA');
            return Users.update(req.params.id, req.body);
        })
        .then(() => { 
            res.status(200).json({ ...existingUser, ...req.body });
        })
        .catch((err) => {
            console.log(err);
            if (err === 'RECORD_NOT_FOUND')
                res.status(404).send(`User with ${req.params.id} not found.`);
            else if (err === 'INVALID_DATA')
                res.status(422).json({ validationErrors: validationErrors.details });
            else 
                res.status(500).send('Error updating a user');
        });
});

usersRouter.delete('/:id', (req,res) => {
    Users.destroy(req.params.id)
        .then((deleted) => {
            deleted ? res.status(200).send('User deleted') : res.status(404).send('User not found')
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error deleting a user');
        });
});




module.exports = usersRouter;