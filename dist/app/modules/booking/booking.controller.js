"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const booking_service_1 = require("./booking.service");
const createBooking = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const decodeToken = req.user;
    const booking = yield booking_service_1.BookingService.createBooking(req.body, decodeToken.userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Booking created successfully",
        data: booking,
    });
}));
// const getUserBookings = catchAsync(
//     async (req: Request, res: Response) => {
//         const bookings = await BookingService.getUserBookings();
//         sendResponse(res, {
//             statusCode: 200,
//             success: true,
//             message: "Bookings retrieved successfully",
//             data: bookings,
//         });
//     }
// );
// const getSingleBooking = catchAsync(
//     async (req: Request, res: Response) => {
//         const booking = await BookingService.getBookingById();
//         sendResponse(res, {
//             statusCode: 200,
//             success: true,
//             message: "Booking retrieved successfully",
//             data: booking,
//         });
//     }
// );
// const getAllBookings = catchAsync(
//     async (req: Request, res: Response) => {
//         // eslint-disable-next-line @typescript-eslint/no-unused-vars
//         const bookings = await BookingService.getAllBookings();
//         sendResponse(res, {
//             statusCode: 200,
//             success: true,
//             message: "Bookings retrieved successfully",
//             data: {},
//             // meta: {},
//         });
//     }
// );
// const updateBookingStatus = catchAsync(
//     async (req: Request, res: Response) => {
//         const updated = await BookingService.updateBookingStatus(
//         );
//         sendResponse(res, {
//             statusCode: 200,
//             success: true,
//             message: "Booking Status Updated Successfully",
//             data: updated,
//         });
//     }
// );
exports.BookingController = {
    createBooking,
    // getAllBookings,
    // getSingleBooking,
    // getUserBookings,
    // updateBookingStatus,
};
