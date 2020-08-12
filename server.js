const Moment = require("moment-timezone");
console.log(Moment.tz(new Date(), "Asia/Manila").format("YYYY-MM-DD HH:mm:ss"));

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const app = express();
const config = require("./src/config/config");
const port = process.env.PORT || config.port;
const timezone = process.env.TZ || config.timezone;

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(morgan("combined"));
app.use(express.static("public"));

const Login = require("./src/router/Login");
app.use("/api/login", Login);

const User = require("./src/router/User");
app.use("/api/user", User);

const Admin = require("./src/router/Admin");
app.use("/api/admin", Admin);

app.listen(port, () => {
    console.log("Server is running on port " + port);
    console.log("Timezone: " + timezone);
});