const seriesRouter = require('../routes/series.routes');
const usersRouter = require('../routes/users.routes');

const setupRoutes = (app) => {
    app.use('/api/series', seriesRouter);
    app.use('/api/users', usersRouter);
};

module.exports = { setupRoutes };