"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchAsync = void 0;
const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
        // if (envVars.NODE_ENV === "development") {
        //   console.log(err);
        // }
        next(err);
    });
};
exports.catchAsync = catchAsync;
