const express = require("express");
const cors = require("cors");
require("./db/config");
const User = require("./db/User");
const Product = require("./db/Product");

//JSON Web Token
var jwt = require("jsonwebtoken");
var privateKey = "e-commerce";

const app = express();
app.use(express.json());
app.use(cors());

//API to register user 
app.post("/register", async (req, res) => {
  let user = new User(req.body);
  let result = await user.save();
  result = result.toObject();
  delete result.password;
  jwt.sign({ result }, privateKey, { expiresIn: "1h" }, (err, token) => {
    if (err) {
      res.send({ result: "Something went wrong" });
    } else {
      res.send({ result, auth: token });
    }
  });
});

//API to login user
app.post("/login", async (req, res) => {
  if (req.body.email && req.body.password) {
    let user = await User.findOne(req.body).select("-password");
    if (user) {
      //token Code
      jwt.sign(
        { _id: user._id },
        privateKey,
        { expiresIn: "1h" },
        (err, token) => {
          if (err) {
            res.send({ result: "No user Found" });
          } else {
            res.send({ user, auth: token });
          }
        }
      );
    } else {
      res.send({ result: "No user Found" });
    }
  } else {
    res.send({ error: "Email and Password are required!" });
  }
});

//API to add product by login user
app.post("/add-product",verifyToken, async (req, res) => {
  let product = await new Product(req.body).save();
  res.status(201).send(product);
});

//API to get product by logged user
app.get("/products", async (req, res) => {
  let products = await Product.find();
  if (products.length > 0) {
    res.send(products);
  } else {
    res.send({ result: "No product found" });
  }
});

//API to delete product with specific id by logged user
app.delete("/product/:id", async (req, res) => {
  const result = await Product.deleteOne({ _id: req.params.id });
  res.send(result);
});
//API to get product with specific id by logged user
app.get("/product/:id",verifyToken, async (req, res) => {
  const result = await Product.findOne({ _id: req.params.id });
  if (result) {
    res.send(result);
  } else {
    res.send("No result found");
  }
});

//API to update product with specific id by logged user
app.put("/product/:id", async (req, res) => {
  let result = await Product.updateOne(
    { _id: req.params.id },
    { $set: req.body }
  );
  res.send(result);
});

//API to search product with key by logged user
app.get("/search/:key", verifyToken, async (req, res) => {
  let result = await Product.find({
    $or: [
      { name: { $regex: req.params.key } },
      { company: { $regex: req.params.key } },
      { price: { $regex: req.params.key } },
      { category: { $regex: req.params.key } },
    ],
  });
  res.send(result);
});

//Middleware to verify token of logged user
function verifyToken(req, res, next) {
  let token = req.headers["authorization"];
  if (token) {
    token = token.split(" ")[1];
    console.warn("middleware called", token);
    jwt.verify(token, privateKey, (err, valid) => {
      if (err) {
        //return res.status(403).json({ message: "Invalid Token" });
        res.status(403).send({result:"Please provide valid token"})
      } else {
        next();
      }
    });
  } else {
    res.status(401).send({ result: "Please add token with header" });
  }
}

app.listen(4500);
