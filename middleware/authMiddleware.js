const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AsyncManager = require("../utils/asyncManager");
const TwoFactorError = require("../utils/twoFactorError");

function protect(omitSecondFactor = false) {
    AsyncManager(async (req, res, next) => {
        // 1) Getting token and check if it's there
        let token;
        if (req.cookies.facade) {
            token = req.cookies.facade;
        }

        if (!token) {
            return next(
                new TwoFactorError(
                    "You are not logged in! Please log in to get access.",
                    401
                )
            );
        }

        // 2) Verification token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        const { is2FAuthenticated } = decoded;

        // 3) Check if user still exists
        const currentUser = await User.findById(decoded.id);

        if (currentUser) {
            if (
                !omitSecondFactor &&
                currentUser.twoFactorAuthEnabled &&
                !is2FAuthenticated
            ) {
                next(new TwoFactorError("Wrong authentication token", 401));
            } else {
                req.user = currentUser;
                next();
            }
        } else {
            return next(
                new TwoFactorError(
                    "The user belonging to this token does no longer exist.",
                    401
                )
            );
        }

        // GRANT ACCESS TO PROTECTED ROUTE
        req.user = currentUser;
        next();
    });
}

module.exports = protect;
