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
exports.StatsService = void 0;
const booking_model_1 = require("../booking/booking.model");
const payment_interface_1 = require("../payment/payment.interface");
const payment_model_1 = require("../payment/payment.model");
const tour_model_1 = require("../tour/tour.model");
const user_interface_1 = require("../user/user.interface");
const user_model_1 = require("../user/user.model");
const now = new Date();
const sevenDaysAgo = new Date(now).setDate(now.getDate() - 7);
const thirtyDaysAgo = new Date(now).setDate(now.getDate() - 30);
const getUserStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalUsersPromise = user_model_1.User.countDocuments();
    const totalActiveUsersPromise = user_model_1.User.countDocuments({
        isActive: user_interface_1.IsActive.ACTIVE,
    });
    const totalInActiveUsersPromise = user_model_1.User.countDocuments({
        isActive: user_interface_1.IsActive.INACTIVE,
    });
    const totalBlockedUsersPromise = user_model_1.User.countDocuments({
        isActive: user_interface_1.IsActive.BLOCKED,
    });
    const newUsersInLast7DaysPromise = user_model_1.User.countDocuments({
        createdAt: { $gt: sevenDaysAgo },
    });
    const newUsersInLast30DaysPromise = user_model_1.User.countDocuments({
        createdAt: { $gt: thirtyDaysAgo },
    });
    const usersByRolePromise = user_model_1.User.aggregate([
        //stage - 1: grouping users by role and count total users in each role
        {
            $group: {
                _id: "$role",
                count: { $sum: 1 },
            },
        },
    ]);
    const [totalUsers, totalActiveUsers, totalInActiveUsers, totalBlockedUsers, newUsersInLast7Days, newUsersInLast30Days, usersByRole,] = yield Promise.all([
        totalUsersPromise,
        totalActiveUsersPromise,
        totalInActiveUsersPromise,
        totalBlockedUsersPromise,
        newUsersInLast7DaysPromise,
        newUsersInLast30DaysPromise,
        usersByRolePromise,
    ]);
    return {
        totalUsers,
        totalActiveUsers,
        totalInActiveUsers,
        totalBlockedUsers,
        newUsersInLast7Days,
        newUsersInLast30Days,
        usersByRole,
    };
});
const getTourStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalTourPromise = tour_model_1.Tour.countDocuments();
    const totalTourByTourTypePromise = tour_model_1.Tour.aggregate([
        //stage - 1: connect Tour Type model - lookup stage
        {
            $lookup: {
                from: "tourtypes",
                localField: "tourType",
                foreignField: "_id",
                as: "type",
            },
        },
        //stage -2 : unwind the array to object
        {
            $unwind: "$type",
        },
        // stage - 3 : grouping tour types
        {
            $group: {
                _id: "type.name",
                count: { $sum: 1 },
            },
        },
    ]);
    const avgTourCostPromise = tour_model_1.Tour.aggregate([
        //Stage-1: group the cost from, do sum, and average teh sum
        {
            $group: {
                _id: null,
                avgCostFrom: { $avg: "$costFrom" },
            },
        },
    ]);
    const totalTourByDivisionPromise = tour_model_1.Tour.aggregate([
        //stage - 1: connect Division Type model - lookup stage
        {
            $lookup: {
                from: "divisions",
                localField: "division",
                foreignField: "_id",
                as: "division",
            },
        },
        //stage -2 : unwind the array to object
        {
            $unwind: "$division",
        },
        // stage - 3 : grouping tour types
        {
            $group: {
                _id: "division.name",
                count: { $sum: 1 },
            },
        },
    ]);
    const totalHighestBookedTourPromise = booking_model_1.Booking.aggregate([
        //stage- 1: group the tour
        {
            $group: {
                _id: "$tour",
                bookingCount: { $sum: 1 },
            },
        },
        //sort the tour
        {
            $sort: { bookingCount: -1 },
        },
        // limit -5
        {
            $limit: 5,
        },
        //stage-4 lookup stage
        {
            $lookup: {
                from: "tours",
                let: { tourId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$_id", "$$tourId"] },
                        },
                    },
                ],
                as: "tour",
            },
        },
        //stage 5 : unwind stage
        {
            $unwind: "$tour",
        },
        //stage-6 project stage
        {
            $project: {
                bookingCount: 1,
                "tour.title": 1,
                "tour.slug": 1,
            },
        },
    ]);
    const [totalTour, totalTourByTourType, avgTourCost, totalTourByDivision, totalHighestBookedTour,] = yield Promise.all([
        totalTourPromise,
        totalTourByTourTypePromise,
        avgTourCostPromise,
        totalTourByDivisionPromise,
        totalHighestBookedTourPromise,
    ]);
    return {
        totalTour,
        totalTourByTourType,
        avgTourCost,
        totalTourByDivision,
        totalHighestBookedTour,
    };
});
const getBookingStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalBookingPromise = booking_model_1.Booking.countDocuments();
    const totalBookingByStatusPromise = booking_model_1.Booking.aggregate([
        //stage-1 group stage
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
            },
        },
    ]);
    const bookingPerTourPromise = booking_model_1.Booking.aggregate([
        //stage - 1 group stage
        {
            $group: {
                _id: "$tour",
                bookingCount: { $sum: 1 },
            },
        },
        //stage -2 sort stage
        {
            $sort: { bookingCount: -1 },
        },
        //stage - 3 limit
        {
            $limit: 10,
        },
        //  stage - 4 ,
        {
            $lookup: {
                from: "tours",
                localField: "_id",
                foreignField: "_id",
                as: "tour",
            },
        },
        // stage- 5 unwind
        {
            $unwind: "$tour",
        },
        //
        {
            $project: {
                bookingCount: 1,
                _id: 1,
                "tour.title": 1,
                "tour.slug": 1,
            },
        },
    ]);
    const avgGuestCountPerBookingPromise = booking_model_1.Booking.aggregate([
        // stage 1 - group stage
        {
            $group: {
                _id: null,
                avgGuestCount: { $avg: "$guestCount" },
            },
        },
    ]);
    const bookingsLast7DaysPromise = booking_model_1.Booking.countDocuments({
        createdAt: { $gt: sevenDaysAgo },
    });
    const bookingsLast30DaysPromise = booking_model_1.Booking.countDocuments({
        createdAt: { $gt: thirtyDaysAgo },
    });
    const totalBookingByUniqueUsersPromise = booking_model_1.Booking.distinct("user").then(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (user) => user.length);
    const [totalBooking, totalBookingByStatus, bookingPerTour, avgGuestCountPerBooking, bookingsLast7Days, bookingsLast30Days, totalBookingByUniqueUsers,] = yield Promise.all([
        totalBookingPromise,
        totalBookingByStatusPromise,
        bookingPerTourPromise,
        avgGuestCountPerBookingPromise,
        bookingsLast7DaysPromise,
        bookingsLast30DaysPromise,
        totalBookingByUniqueUsersPromise,
    ]);
    return {
        totalBooking,
        totalBookingByStatus,
        bookingPerTour,
        avgGuestCountPerBooking: avgGuestCountPerBooking[0].avgGuestCount,
        bookingsLast7Days,
        bookingsLast30Days,
        totalBookingByUniqueUsers,
    };
});
const getPaymentStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalPaymentPromise = payment_model_1.Payment.countDocuments();
    const totalPaymentByStatusPromise = payment_model_1.Payment.aggregate([
        //stage 1
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
            },
        },
    ]);
    const totalRevenuePromise = payment_model_1.Payment.aggregate([
        //stage 1 - match stage
        {
            $match: { status: payment_interface_1.PAYMENT_STATUS.PAID },
        },
        //
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$amount" },
            },
        },
    ]);
    const avgPaymentAmountPromise = payment_model_1.Payment.aggregate([
        //stage 1 - group stage
        {
            $group: {
                _id: null,
                avgPaymentAmount: { $avg: "$amount" },
            },
        },
    ]);
    const paymentGatewayDataPromise = payment_model_1.Payment.aggregate([
        //stage 1 - group stage
        {
            $group: {
                _id: { $ifNull: ["$paymentGatewayData.status", "UNKNOWN"] },
                count: { $sum: 1 },
            },
        },
    ]);
    const [totalPayment, totalPaymentByStatus, totalRevenue, avgPaymentAmount, paymentGatewayData,] = yield Promise.all([
        totalPaymentPromise,
        totalPaymentByStatusPromise,
        totalRevenuePromise,
        avgPaymentAmountPromise,
        paymentGatewayDataPromise,
    ]);
    return {
        totalPayment,
        totalPaymentByStatus,
        totalRevenue,
        avgPaymentAmount,
        paymentGatewayData,
    };
});
exports.StatsService = {
    getBookingStats,
    getPaymentStats,
    getTourStats,
    getUserStats,
};
