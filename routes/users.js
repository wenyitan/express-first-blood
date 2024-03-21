var express = require('express');
var router = express.Router();
const dotenv = require('dotenv').config();
const mysql = require("mysql2")

const pool = mysql.createPool({
  host: process.env.dbHost,
  user: process.env.dbUser,
  password: process.env.dbPassword,
  database: process.env.dbDatabase,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
})

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send({username:"username", password: "password"});
});

/* GET all users */
router.get('/all', function(req, res, next) {
  pool.query('select * from customers', (err, rows, fields)=> {
    if (err) throw err;
    res.send(rows);
  })
})

/* GET and DELETE user/customers by id */
router.route("/:userId")
  .get(function(req, res, next) {
    let userId = req.params.userId
    let selectQuery = "select * from customers where customerId=?;"
    pool.query(selectQuery, [userId], (err, rows, fields)=> {
      if (err) throw err;
      console.log(rows.length)
      if (rows.length === 0) {
        res.status(404).json({"error": `Customer with id=${userId} not found.`})
        // res.json({"error": `Customer with id=${userId} not found.`})
      } else {
        res.json(rows.at(0));
      }
    })
  })
  .delete((req, res)=> {
    const customerId = req.params.userId;
    let deleteQuery = "delete from customers where customerId = ?"
    pool.query(deleteQuery, [customerId], (err, rows)=> {
      if (err) throw err;
      res.json({"success": `Customer with id=${req.params.userId} deleted.`});
    });
  });

/* POST (create) and PUT (update) user using request body*/
router.route("/user")
  .post((req, res) => {
    const {firstName, lastName, address, ...rest} = req.body;
    let insertQuery = "INSERT into customers (firstName, lastName, address) values (?, ?, ?);"
    pool.query(insertQuery, [firstName, lastName, address], (err, rows)=> {
        if (err) throw err;
        res.json({"customerId": rows.insertId, ...req.body});
      })
  
  })
  .put((req, res) => {
    const {firstName, lastName, address, customerId} = req.body;
    let updateQuery = "UPDATE customers SET `firstName` = ?, `lastName` = ?, `address` = ? where (`customerId` = ?);"
    pool.query(updateQuery, [firstName, lastName,address,customerId], (err, rows) => {
        if (err) throw err;
        let rowsAffected = rows.affectedRows;
        if (rowsAffected === 0) {
          res.json({"error": `0 Rows updated. Please check the request body.`}).status(400);
        } else {
          res.json(req.body);
        }
      }
    )
  })

module.exports = router;
