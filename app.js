require("dotenv").config();

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const erv = require("express-react-views");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

const authRouter = require("./routes/authRouter");
const feedRouter = require("./routes/feedRouter");
const postRouter = require("./routes/postRouter");
const profileRouter = require("./routes/profileRouter");
const commentRouter = require("./routes/commentRouter");
const searchRouter = require("./routes/searchRouter");
const followRouter = require('./routes/followRouter');

// const DB_NAME = 'mockSlowkilo';

// DB CONNECTION
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then((x) => {
    console.log(`Connected to DB: "${x.connections[0].name}"`);
  })
  .catch((err) => {
    console.error("Error connecting to mongo", err);
  });

const app = express();

// VIEW ENGINE SETUP
app.set("views", __dirname + "/views");
app.set("view engine", "jsx");
app.engine("jsx", erv.createEngine());

// MIDDLEWARE
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// SESSIONS MIDDLEWARE
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    // cookie: { maxAge: 3600000 * 1 },	// 1 hour // Time after which the cookie saved on the browser expires
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 60 * 60 * 24 * 7,
      // `ttl` Time to live - after which the session document saved
      // in the DB expires - 7 days (14 days is the default if the option is not explicityl set)
    }),
  })
);

// ROUTES
app.use("/auth", authRouter);
app.use("/feed", feedRouter);
app.use("/posts", postRouter);
app.use("/profile", profileRouter);
app.use("/comment", commentRouter);
app.use("/search", searchRouter);
app.use('/follow', followRouter);

/* GET home page. */
app.get("/", (req, res, next) => {
  res.render("Home");
});

module.exports = app;
