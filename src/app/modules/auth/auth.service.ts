/* eslint-disable @typescript-eslint/no-non-null-assertion */
import AppError from "../../errorHelpers/AppError";
// import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";

import { creteNewAccessTokenWithRefreshToken } from "../../utils/userTokens";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import { IAuthProvider } from "../user/user.interface";

// const credentialsLogin = async (payload: Partial<IUser>) => {
//   const { email, password } = payload;

//   const isUserExist = await User.findOne({ email });

//   if (!isUserExist) {
//     throw new AppError(httpStatus.BAD_REQUEST, "Email Does not Exists !");
//   }

//   const isPasswordMatch = await bcryptjs.compare(
//     password as string,
//     isUserExist.password as string
//   );

//   if (!isPasswordMatch) {
//     throw new AppError(httpStatus.BAD_REQUEST, "Incorrect Password !");
//   }

//   // const jwtPayload = {
//   //   userId: isUserExist._id,
//   //   email: isUserExist.email,
//   //   role: isUserExist.role,
//   // };

//   // //   const accessToken = jwt.sign(jwtPayload, "secret", { expiresIn: "1d" });

//   // const accessToken = generateToken(
//   //   jwtPayload,
//   //   envVars.JWT_ACCESS_SECRET,
//   //   envVars.JWT_ACCESS_EXPIRES
//   // );

//   // const refreshToken = generateToken(
//   //   jwtPayload,
//   //   envVars.JWT_REFRESH_SECRET,
//   //   envVars.JWT_REFRESH_EXPIRES
//   // );

//   const userTokens = createUserTokens(isUserExist);

//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const { password: pass, ...rest } = isUserExist.toObject();

//   return {
//     // ...rest,
//     // email: isUserExist.email,
//     accessToken: userTokens.accessToken,
//     refreshToken: userTokens.refreshToken,
//     user: rest,
//   };
// };

const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken = await creteNewAccessTokenWithRefreshToken(
    refreshToken
  );

  // const userTokens = createUserTokens(isUserExist);

  return {
    accessToken: newAccessToken,
  };
};

const resetPassword = async () =>
  // oldPassword: string,
  // newPassword: string,
  // decodedToken: JwtPayload
  {
    // const user = await User.findById(decodedToken.userId);
    // const isOldPasswordMatch = await bcryptjs.compare(
    //   oldPassword,
    //   user!.password as string
    // );
    // if (!isOldPasswordMatch) {
    //   throw new AppError(httpStatus.UNAUTHORIZED, "Old Password does not match");
    // }

    // user!.password = await bcryptjs.hash(
    //   newPassword,
    //   Number(envVars.BCRYPT_SALT_ROUND)
    // );

    // user?.save();

    return {};
  };

const setPassword = async (userId: string, plainPassword: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(404, "User not Found");
  }

  if (
    user.password &&
    user.auths.some((providerObject) => providerObject.provider === "google")
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You have already set your password. Now you can change the password from your profile update."
    );
  }

  const hashedPassword = await bcryptjs.hash(
    plainPassword,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const credentialProvider: IAuthProvider = {
    provider: "credentials",
    providerID: user.email,
  };

  const auths: IAuthProvider[] = [...user.auths, credentialProvider];

  user.password = hashedPassword;

  user.auths = auths;

  await user.save()
};

const changePassword = async (
  oldPassword: string,
  newPassword: string,
  decodedToken: JwtPayload
) => {
  const user = await User.findById(decodedToken.userId);
  const isOldPasswordMatch = await bcryptjs.compare(
    oldPassword,
    user!.password as string
  );
  if (!isOldPasswordMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Old Password does not match");
  }

  user!.password = await bcryptjs.hash(
    newPassword,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  user?.save();
};

// jwt // user- login- Token (email, role, _id) - booking, payment, booking, payment cancel -

export const AuthServices = {
  // credentialsLogin,
  getNewAccessToken,
  resetPassword,
  setPassword,
  changePassword,
};
