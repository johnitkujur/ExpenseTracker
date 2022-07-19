const express = require("express");
require("./db/mongoose");
const userRouter = require("./routers/user");
const transactionRouter = require("./routers/transaction");

const app = express();

const cors = require("cors");
app.options("*", cors());
app.use(cors());

app.use(express.json());
app.use(userRouter);
app.use(transactionRouter);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "YOUR-DOMAIN.TLD"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const port = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Testing");
});

app.listen(port, () => {
  console.log("listening on " + port);
});
