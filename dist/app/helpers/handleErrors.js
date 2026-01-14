"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleZodError = exports.handleValidationError = exports.handleCastError = exports.handleDuplicateError = void 0;
const handleDuplicateError = (err) => {
    const match = err.message.match(/"([^"]*)"/);
    const matchedArray = match ? match[1] : "Duplicate value";
    return {
        statusCode: 400,
        message: `${matchedArray[1]} already exists`,
    };
};
exports.handleDuplicateError = handleDuplicateError;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleCastError = (err) => {
    return {
        statusCode: 400,
        message: "Invalid MongoDB ObjectId. Please provide a valid id !",
    };
};
exports.handleCastError = handleCastError;
const handleValidationError = (err) => {
    const errorSources = [];
    const errors = Object.values(err.errors.path);
    errors.forEach((errorObject) => errorSources.push({
        path: errorObject.path,
        message: errorObject.message,
    }));
    return {
        statusCode: 400,
        message: "validation Error",
        errorSources,
    };
};
exports.handleValidationError = handleValidationError;
const handleZodError = (err) => {
    const errorSources = [];
    err.issues.forEach((issue) => {
        errorSources.push({
            path: issue.path[issue.path.length - 1],
            message: issue.message,
        });
    });
    return {
        statusCode: 400,
        message: "Zod Error",
        errorSources,
    };
};
exports.handleZodError = handleZodError;
