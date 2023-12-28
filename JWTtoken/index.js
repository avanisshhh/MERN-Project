const express = require("express");

const jwt = require("jsonwebtoken");
const app = express();
const secureKey = "jwt22";
app.get("/", (req, res) => {
  res.send({ message: "Hello World" });
});

app.post("/login", (req, res) => {
  const user = {
    id: 1,
    username: "admin",
    email: "abc@gmail.com",
  };
  //parameter 1. details  2.security key 3.expiry time  4.callback fn
  jwt.sign({ user }, secureKey, { expiresIn: "30m" }, (err, token) => {
    res.json({
      token,
    });
  });
});

app.post("/profile", tokenVerify, (req, res) => {
  jwt.verify(req.token, secureKey, (err, authData) => {
    if (err) {
      return res.status(403).send({ message: "Invalid Token" });
    } else {
      res.json({
        message: "Profile Accessed",
        authData,
      });
    }
  });
});

function tokenVerify(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const token = bearerHeader.split(" ")[1];
    console.log(token);
    req.token = token;
    next();
  } else {
    res.send({
      result: "token is not valid",
    });
  }
}

app.listen(4000, () => {
  console.log("App is running");
});
