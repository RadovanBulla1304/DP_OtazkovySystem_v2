exports.errorHandler = (err, req, res, next) => {
    res.status(err.statusCode || 500).send({ message: err.message, reason: err.reason });
};
