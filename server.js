require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const connectToDB = require("./database/db");
const ErrorsMiddleware = require("./middleware/mongooseErrorHandler");
const authRoutes = require("./routes/authRoutes");

process.on("uncaughtException", (error) => {
    console.log("Uncaught Exception! 🔥 💣 stopping the server...");
    console.log(error.name, error.message);
    process.exit(1);
});

// Initialize the app
const app = express();

//connect to database
connectToDB();

//enable our app to parse JSON
app.use(express.json());

//jwt in cookie will be available
// through request.cookies
app.use(cookieParser());

// declare our PORT
const PORT = process.env.PORT || 5000;

// Mount/Create Routes
app.get("/", (req, res) => {
    res.json({
        Hi: "Welcome to the NodeJS 2FA App",
    });
});
app.use("/api/v1/", authRoutes);

// Error middleware
app.use(ErrorsMiddleware);

// We want our server to listen on our declared PORT variable
const server = app.listen(
    PORT,
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    )
);

process.on("unhandledRejection", (error) => {
    console.log("Unhandled Rejection... 💣 🔥 stopping the server....");
    console.log(error.name, error.message);
    server.close(() => {
        //exit code 1 means there is an issue that caused
        // the program to exit.
        process.exit(1);
    });
});
