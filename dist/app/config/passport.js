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
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const env_1 = require("./env");
const user_model_1 = require("../modules/user/user.model");
const user_interface_1 = require("../modules/user/user.interface");
const passport_local_1 = require("passport-local");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Normal login with email and password
passport_1.default.use(new passport_local_1.Strategy({
    usernameField: "email",
    passwordField: "password",
}, (email, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isUserExist = yield user_model_1.User.findOne({ email });
        if (!isUserExist) {
            return done(null, false, { message: "User Does not exist !" });
        }
        if (!isUserExist.isVerified) {
            return done("User Is not Verified !");
        }
        if (isUserExist.isActive === user_interface_1.IsActive.BLOCKED ||
            isUserExist.isActive === user_interface_1.IsActive.INACTIVE) {
            return done(`User Is ${isUserExist.isActive} !`);
        }
        if (isUserExist.isDeleted) {
            return done("User Is Deleted !");
        }
        const isGoogleAuthenticated = isUserExist.auths.some((providerObjects) => providerObjects.provider == "google");
        if (isGoogleAuthenticated && !isUserExist.password) {
            return done(null, false, {
                message: "You have authenticated through Google. So if you want to login with credentials, then at first login with google and set a password for your Gmail and then you can login with email and password.",
            });
        }
        const isPasswordMatch = yield bcryptjs_1.default.compare(password, isUserExist.password);
        if (!isPasswordMatch) {
            return done(null, false, { message: "Password Does Not Match !" });
        }
        return done(null, isUserExist);
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        done(error);
    }
})));
//Google Login
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: env_1.envVars.GOOGLE_CLIENT_ID,
    clientSecret: env_1.envVars.GOOGLE_CLIENT_SECRET,
    callbackURL: env_1.envVars.GOOGLE_CALLBACK_URL,
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const email = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0].value;
        if (!email) {
            return done(null, false, { message: "No email found" });
        }
        let isUserExist = yield user_model_1.User.findOne({ email });
        if (isUserExist && !isUserExist.isVerified) {
            // done("User Is not Verified !");
            return done(null, false, { message: "User is not verified" });
        }
        if (isUserExist &&
            (isUserExist.isActive === user_interface_1.IsActive.BLOCKED ||
                isUserExist.isActive === user_interface_1.IsActive.INACTIVE)) {
            return done(`User Is ${isUserExist.isActive} !`);
        }
        if (isUserExist && isUserExist.isDeleted) {
            // done("User Is Deleted !");
            return done(null, false, { message: "User is Deleted" });
        }
        if (!isUserExist) {
            isUserExist = yield user_model_1.User.create({
                email,
                name: profile.displayName,
                picture: (_b = profile.photos) === null || _b === void 0 ? void 0 : _b[0].value,
                role: user_interface_1.Role.USER,
                isVerified: true,
                auths: [
                    {
                        provider: "google",
                        providerID: profile.id,
                    },
                ],
            });
        }
        return done(null, isUserExist);
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.log("Google Strategy Error", error);
        return done(error);
    }
})));
//frontend localhost:5173/login?redirect=/booking -> localhost:5000/api/v1/auth/google?redirect=/booking -> passport -> Google oauth consent -> gmail login -> successfully -> callback url === localhost:5000/api/v1/auth/google/callback -> db store -> token
// Bridge  == Google -> user db store -> token or create and give a token
//Cistom -> email, password, role:USER, name ... -> registration -> DB -> 1 use create
//Google -> req -> google sign in-> successfully :::: Jwt Token : Role, email -> DB - store -> token ==>  api access
// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport_1.default.serializeUser((user, done) => {
    done(null, user._id);
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.User.findById(id);
        done(null, user);
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        done(error);
    }
}));
