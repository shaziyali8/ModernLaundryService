var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "gtijogetdev",
  user: "EComm",
  port : 3307,
  password: "Ecom@123",
  database: "jwdb",
});

connection.connect((err) => console.log(+err ? "DB Error!!" : "DB connected!!"));

module.exports = connection