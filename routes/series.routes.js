const seriesRouter = require('express').Router();
const Series = require('../models/series/series.model');

seriesRouter.get('/', (req, res) => {
    const { year, color } = req.query;
    Series.findMany({ filters: { year, color }})
        .then((series) => {
            res.json(series);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error retrieving series from database');
        });
});

seriesRouter.get('/:id', (req, res) => {
    Series.findOne(req.params.id)
        .then((serie) => {
            serie ? res.json(serie) : res.status(400).send('Serie not found')
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error retrieving serie from database');
        });
});

seriesRouter.post('/', (req, res) => {
    const error = Series.validate(req.body);
    error 
    ? res.status(422).json({validationErrors: error.details })
    : Series.create(req.body)
        .then((createSerie) => {
            res.status(201).json(createSerie);
        })
        .catch((err) => {
            console.log(err)
            res.status(500).send('Error saving the serie');
        });
});

seriesRouter.put(':/id', (req,res) => {
    let existingSerie = null;
    let validationErrors = null;
    Series.findOne(req.params.id)
        .then((serie) => {
            existingSerie = serie;
            if (!existingSerie) return Promise.reject('RECORD_NOT_FOUND');
            validationErrors = Series.validate(req.body, false);
            if (existingSerie) return Promise.reject('INVALID_DATA');
            return Series.update(req.params.id, req.body);
        })
        .then(() => { 
            res.status(200).json({ ...existingSerie, ...req.body });
        })
        .catch((err) => {
            console.log(err);
            if (err === 'RECORD_NOT_FOUND')
                res.status(404).send(`Serie with ${req.params.id} not found.`);
            else if (err === 'INVALID_DATA')
                res.status(422).json({ validationErrors: validationErrors.details });
            else 
                res.status(500).send('Error updating a serie');
        });
});

seriesRouter.delete('/:id', (req,res) => {
    Series.destroy(req.params.id)
        .then((deleted) => {
            deleted ? res.status(200).send('Serie deleted') : res.status(404).send('Serie not found')
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error deleting a serie');
        });
});

module.exports = seriesRouter;