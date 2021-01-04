const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add your name"],
    },
    email: {
        type: String,
        required: [true, "Please provide your correct email address"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid email address"],
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: 8,
        // specifies whether or not password will be included in query results.
        select: false,
    },
    confirmPassword: {
        type: String,
        required: [true, "Please confirm your password"],
        validate: {
            //validator will only work on CREATE and SAVE
            validator: function (pass) {
                return pass === this.password;
            },
            message: "Passwords are not the same",
        },
    },
    //to store the value of the auth code
    twoFactorAuthCode: String,
    // boolean flag to enable or disable two factor auth
    twoFactorAuthEnabled: Boolean,
});

// Password Encryption & hash with pre hook
UserSchema.pre("save", async function (next) {
    // if password is modified, that's when you return this function
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    // don't save the confirmPassword field
    this.confirmPassword = undefined;
    next();
});

// Sign token
UserSchema.methods.signJwtToken = function (is2FAuthenticated = false) {
    return jwt.sign(
        { id: this._id, is2FAuthenticated },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn: process.env.JWT_EXPIRES_IN,
        }
    );
};

// match user password to hashed password in DB
UserSchema.methods.correctPassword = async function (userPassword) {
    return await bcrypt.compare(userPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
