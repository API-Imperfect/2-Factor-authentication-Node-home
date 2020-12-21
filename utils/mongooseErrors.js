const TwoFactorError = require("./twoFactorError");

const handleCastError = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new TwoFactorError(message, 400);
};

const handleDuplicateFields = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    console.log(value);

    const message = `Duplicate field value: ${value}. Please enter another value!`;
    return new TwoFactorError(message, 400);
};

const handleValidationError = (err) => {
    //use Object.values method to return an array of errors
    //after which we use the map method to create a new array
    const errors = Object.values(err.errors).map((e) => e.message);

    const message = `Invalid input data. ${errors.join(". ")}`;
    return new TwoFactorError(message, 400);
};

//in development we want to send out as much information as possible
const devErrors = (err, res) => {
    res.status(err.statusCode).json({
        status: err.statusCode,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const prodErrors = (err, res) => {
    // if Operational error, send json to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        // its a programming error, don't give details
        // but send a generalized message
        console.log("Error", err);
        res.status(500).json({
            status: "error",
            message: "Something didn't go well",
        });
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {
        devErrors(err, res);
    } else if (process.env.NODE_ENV === "production") {
        let error = { ...err };

        if (error.name === "CastError") error = handleCastError(error);
        if (error.code === 11000) error = handleDuplicateFields(error);
        if (error.name === "ValidationError")
            error = handleValidationError(error);

        prodErrors(error, res);
    }
};
