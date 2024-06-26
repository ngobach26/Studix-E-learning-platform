const express = require('express');
const app = express();
const db = require('./database');
const path = require('path')
const cors = require('cors');
require("dotenv").config();

app.use(cors({
  origin: "http://localhost:5173"
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRouter = require("./routes/Auth")
app.use("/api/auth", authRouter);

const instructorRouter = require("./routes/Instructor")
app.use("/api/instructor", instructorRouter);

const userRouter = require("./routes/User")
app.use("/api/user", userRouter);

const adminRouter = require("./routes/Admin")
app.use("/api/admin", adminRouter);

const courseRouter = require("./routes/Course")
app.use("/api/courses", courseRouter);

app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
    db();
  });
