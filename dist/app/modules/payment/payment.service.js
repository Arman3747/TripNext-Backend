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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const cloudinary_config_1 = require("../../config/cloudinary.config");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const invoice_1 = require("../../utils/invoice");
const sendEmail_1 = require("../../utils/sendEmail");
const booking_interface_1 = require("../booking/booking.interface");
const booking_model_1 = require("../booking/booking.model");
const sslCommerz_service_1 = require("../sslCommerz/sslCommerz.service");
const payment_interface_1 = require("./payment.interface");
const payment_model_1 = require("./payment.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const initPayment = (bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield payment_model_1.Payment.findOne({ booking: bookingId });
    if (!payment) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Payment Not Found. You have not booked this tour. ");
    }
    const booking = yield booking_model_1.Booking.findById(payment.booking);
    const userAddress = (booking === null || booking === void 0 ? void 0 : booking.user).address;
    const userEmail = (booking === null || booking === void 0 ? void 0 : booking.user).email;
    const userPhoneNumber = (booking === null || booking === void 0 ? void 0 : booking.user).phone;
    const userName = (booking === null || booking === void 0 ? void 0 : booking.user).name;
    const sslPayload = {
        address: userAddress,
        email: userEmail,
        phoneNumber: userPhoneNumber,
        name: userName,
        amount: payment.amount,
        transactionId: payment.transactionId,
    };
    const sslPayment = yield sslCommerz_service_1.SSLService.sslPaymentInit(sslPayload);
    return {
        paymentUrl: sslPayment.GatewayPageURL,
    };
});
const successPayment = (query) => __awaiter(void 0, void 0, void 0, function* () {
    //update Booking status to confirm
    // update payment status to paid
    const session = yield booking_model_1.Booking.startSession();
    session.startTransaction();
    try {
        const updatedPayment = yield payment_model_1.Payment.findOneAndUpdate({ transactionId: query.transactionId }, { status: payment_interface_1.PAYMENT_STATUS.PAID }, { new: true, runValidators: true, session });
        if (!updatedPayment) {
            throw new AppError_1.default(401, "Payment not found");
        }
        const updatedBooking = yield booking_model_1.Booking.findByIdAndUpdate(updatedPayment === null || updatedPayment === void 0 ? void 0 : updatedPayment.booking, { status: booking_interface_1.BOOKING_STATUS.COMPLETE }, { new: true, runValidators: true, session })
            .populate("tour", "title")
            .populate("user", "name email");
        if (!updatedBooking) {
            throw new AppError_1.default(401, "Booking not found");
        }
        const invoiceData = {
            bookingDate: updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.createdAt,
            guestCount: updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.guestCount,
            totalAmount: updatedPayment === null || updatedPayment === void 0 ? void 0 : updatedPayment.amount,
            tourTitle: (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.tour).title,
            transactionId: updatedPayment === null || updatedPayment === void 0 ? void 0 : updatedPayment.transactionId,
            userName: updatedBooking.user.name,
        };
        const pdfBuffer = yield (0, invoice_1.generatePdf)(invoiceData);
        const cloudinaryResult = yield (0, cloudinary_config_1.uploadBufferToCloudinary)(pdfBuffer, "invoice");
        if (!cloudinaryResult) {
            throw new AppError_1.default(401, "Error uploading PDF in Cloudinary");
        }
        yield payment_model_1.Payment.findByIdAndUpdate(updatedPayment._id, {
            invoiceUrl: cloudinaryResult === null || cloudinaryResult === void 0 ? void 0 : cloudinaryResult.secure_url,
        }, { runValidators: true, session });
        yield (0, sendEmail_1.sendEmail)({
            to: updatedBooking.user.email,
            subject: "Your Booking invoice",
            templateName: "invoice",
            templateData: invoiceData,
            attachments: [
                {
                    filename: "invoice.pdf",
                    content: pdfBuffer,
                    contentType: "application/pdf",
                },
            ],
        });
        yield session.commitTransaction();
        session.endSession();
        return {
            success: true,
            message: "Payment Completed Successfully",
        };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const failPayment = (query) => __awaiter(void 0, void 0, void 0, function* () {
    //update Booking status to FAIL
    // update payment status to FAIL
    const session = yield booking_model_1.Booking.startSession();
    session.startTransaction();
    try {
        const updatedPayment = yield payment_model_1.Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: payment_interface_1.PAYMENT_STATUS.FAILED,
        }, { new: true, runValidators: true, session });
        yield booking_model_1.Booking.findByIdAndUpdate(updatedPayment === null || updatedPayment === void 0 ? void 0 : updatedPayment.booking, { status: booking_interface_1.BOOKING_STATUS.FAILED }, { new: true, runValidators: true, session });
        yield session.commitTransaction();
        session.endSession();
        return {
            success: false,
            message: "Payment Failed",
        };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const cancelPayment = (query) => __awaiter(void 0, void 0, void 0, function* () {
    //update Booking status to CANCEL
    // update payment status to CANCEL
    const session = yield booking_model_1.Booking.startSession();
    session.startTransaction();
    try {
        const updatedPayment = yield payment_model_1.Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: payment_interface_1.PAYMENT_STATUS.CANCELLED,
        }, { new: true, runValidators: true, session });
        yield booking_model_1.Booking.findByIdAndUpdate(updatedPayment === null || updatedPayment === void 0 ? void 0 : updatedPayment.booking, { status: booking_interface_1.BOOKING_STATUS.CANCEL }, { new: true, runValidators: true, session });
        yield session.commitTransaction();
        session.endSession();
        return {
            success: false,
            message: "Payment Cancelled",
        };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const getInvoiceDownloadUrl = (paymentId) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield payment_model_1.Payment.findById(paymentId).select("invoiceUrl");
    if (!payment) {
        throw new AppError_1.default(401, "payment found fail");
    }
    if (!payment.invoiceUrl) {
        throw new AppError_1.default(401, "invoice url retrieved fail");
    }
    return payment.invoiceUrl;
});
exports.PaymentService = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment,
    getInvoiceDownloadUrl,
};
