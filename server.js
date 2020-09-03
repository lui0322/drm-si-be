const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const app = express();

const Moment = require("moment-timezone");
const util = require("./src/config/util.config");

const port = process.env.PORT || util.port;
const timezone = process.env.TZ || util.timezone;

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(morgan("combined"));
app.use(express.static("public"));

const Login = require("./src/router/login.router");
app.use("/api/login", Login);

const User = require("./src/router/user.router");
app.use("/api/user", User);

const Admin = require("./src/router/admin.router");
app.use("/api/admin", Admin);

app.listen(port, () => {
    console.log("Server is running on port " + port);
    console.log(Moment.tz(new Date(), "Asia/Manila").format("YYYY-MM-DD HH:mm:ss"));
    console.log("Timezone: " + timezone);
});