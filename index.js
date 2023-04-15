const express = require("express");
const api = express();
const connection = require("./dbConnection");

api.use(express.json());

const router = require("./route");
api.use("/", router);

api.listen("5001", (err) => {
  console.log("Server Running at port = localhost:5001");
});
