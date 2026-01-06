/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { BOOKING_STATUS, IBooking } from "./booking.interface";
import httpStatus from "http-status-codes";
import { Booking } from "./booking.model";
import { Payment } from "../payment/payment.model";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { Tour } from "../tour/tour.model";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { getTransactionId } from "../../utils/getTransactionId";

/**
 * Duplicate DB Collections / replica
 *
 * Transaction RollBack
 *
 * REPLICA DB -> [Create Booking ->(ERROR -> all clear ; not update the real DB) Create Payment -> Update Booking] -> REAL DB
 *
 */

const createBooking = async (payload: Partial<IBooking>, userId: string) => {
  const transactionId = getTransactionId();

  const session = await Booking.startSession();
  session.startTransaction();
  try {
    const user = await User.findById(userId);

    if (!user?.phone || !user.address) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Please Update your Profile to Book a Tour."
      );
    }

    const tour = await Tour.findById(payload.tour).select("costFrom");

    if (!tour?.costFrom) {
      throw new AppError(httpStatus.BAD_REQUEST, "No Tour Cost Found!");
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const amount = Number(tour.costFrom) * Number(payload.guestCount!);

    const booking = await Booking.create(
      [
        {
          user: userId,
          status: BOOKING_STATUS.PENDING,
          ...payload,
        },
      ],
      { session: session }
    );

    const payment = await Payment.create(
      [
        {
          booking: booking[0]._id,
          status: PAYMENT_STATUS.UNPAID,
          transactionId: transactionId,
          amount: amount,
        },
      ],
      { session }
    );

    const updatedBooking = await Booking.findByIdAndUpdate(
      booking[0]._id,
      { payment: payment[0]._id },
      { new: true, runValidators: true, session }
    )
      .populate("user", "name email phone address")
      .populate("tour", "title costFrom")
      .populate("payment");

    const userAddress = (updatedBooking?.user as any).address;
    const userEmail = (updatedBooking?.user as any).email;
    const userPhoneNumber = (updatedBooking?.user as any).phone;
    const userName = (updatedBooking?.user as any).name;

    const sslPayload: ISSLCommerz = {
      address: userAddress,
      email: userEmail,
      phoneNumber: userPhoneNumber,
      name: userName,
      amount: amount,
      transactionId: transactionId,
    };

    const sslPayment = await SSLService.sslPaymentInit(sslPayload);

    // console.log(sslPayment);

    await session.commitTransaction(); // transaction
    session.endSession();

    // return updatedBooking;
    return {
      paymentUrl: sslPayment.GatewayPageURL,
      booking: updatedBooking,
    };
  } catch (error: any) {
    await session.abortTransaction(); // rollback
    session.endSession();

    throw error;
  }
};

/**
 * Frontend(localhost:5173) -> User -> Tour -> Book (pending) - Payment(UnPaid) -> SSLCommerce Page -> Payment Complete -> Backend -> Update Payment(PAID) & Booking(CONFIRM) -> redirect to frontend -> frontend(localhost:5173/payment/success)
 */

/**
 * Frontend(localhost:5173) -> User -> Tour -> Book (pending) - Payment(UnPaid) -> SSLCommerce Page -> Payment Complete -> Backend -> Update Payment(FAIL/ CANCEL) & Booking (FAIL / CANCEL)-> redirect to frontend -> frontend(localhost:5173/payment/cancel or localhost:5173/payment/fail)
 */

export const BookingService = {
  createBooking,
  // getUserBookings,
  // getBookingById,
  // updateBookingStatus,
  // getAllBookings,
};
