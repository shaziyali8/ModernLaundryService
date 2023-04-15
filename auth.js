const pool = require("./dbConnection");
const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");
let otp;
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "godaddy.iqt@gmail.com",
    pass: "rqcmkehcjaxnjxxc",
  },
});
module.exports = {
  login: (req, res, next) => {
    const { email, password } = req.body;
    if (email === "" || password === "") {
      return res.send("Please enter all the details");
    }
    pool.query(
      `SELECT * FROM app_fd_tb_customers WHERE c_email='${email}' AND c_password='${password}'`,
      (error, results, fields) => {
        if (results && results.length > 0) {
          jwt.sign(
            { email: email },
            "secretKey",
            { expiresIn: "5000" },
            (err, token) => {
              if (err) {
                console.error(err);
                return res.status(500).json({ message: "Token Error" });
              }
              const data = {
                token: token,
                email: email,
                userId: results[0].id,
              };
              return res.status(200).json(data);
            }
          );
        } else {
          return res.send("Account can't be found");
        }
      }
    );
  },
  signup: (req, res) => {
    const { c_firstName, c_lastName, c_email, c_password,c_RateCodeID,c_areaId } = req.body;
    console.log(c_firstName, c_lastName, c_email, c_password,c_RateCodeID,c_areaId);
    console.log(req.body);
    if (!c_firstName || !c_lastName || !c_email || !c_password) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields" });
    }
    pool.query(
      `SELECT * FROM app_fd_tb_customers WHERE c_email='${c_email}'`,
      (error, results, fields) => {
        if (results && results.length > 0) {
          return res.status(409).json({ message: "Email already exists" });
        } else {
          pool.query(
            `INSERT INTO app_fd_tb_customers (c_firstName, c_lastName, c_email, c_password,c_RateCodeID,c_areaId, isDeleted) VALUES ('${c_firstName}', '${c_lastName}', '${c_email}', '${c_password}', '${c_RateCodeID}','${c_areaId}',${parseInt("0")})`,
            (error, results, fields) => {
              if (error) {
                console.error(error);
                return res
                  .status(500)
                  .json({ message: "Internal Server Error" });
              }
              jwt.sign(
                { email: c_email },
                "secretKey",
                { expiresIn: "1h" },
                (err, token) => {
                  if (err) {
                    console.error(err);
                    return res.status(500).json({ message: "Token Error" });
                  }
                  const data = {
                    userId: results.insertId,
                    token: token,
                    email: c_email,
                  };
                  return res.status(201).json(data);
                }
              );
            }
          );
        }
      }
    );
  },
  token: (req, res, next) => {
    const bearerHeader = req.cookies["token"];
    if (typeof bearerHeader !== "undefined") {
      const bearer = bearerHeader.token;
      const token = bearer.split(" ")[1];
      req.token = bearerHeader;
      jwt.verify(token, "secretKey", (err, data) => {
        if (err) {
          console.log("messed the token");
          res.clearCookie("token");
          return res.redirect("/signin");
        } else {
          console.log("all good");
          next();
        }
      });
    } else {
      next();
    }
  },
  generateOtp: (req, res) => {
    const email = req.body.email;

    console.log("email : " + email);
    if (!email) {
      return res.status(400).json({ error: "Email address is required." });
    }

    pool.query(
      `SELECT * FROM app_fd_tb_customers WHERE email='${email}'`,
      (error, results, fields) => {
        if (error) {
          console.error(error);
          return res
            .status(500)
            .json({ error: "Failed to fetch customer data." });
        }

        if (results.length === 0) {
          console.log("Email not found.");
          return res.status(404).json({ error: "Email not found." });
        }

        otp = Math.floor(Math.random() * 9000) + 1000;
        console.log(otp);

        const mailOptions = {
          to: email,
          subject: "OTP for registration is: ",
          html:
            "<h3>OTP for account verification is </h3><h1 style='font-weight:bold;'>" +
            otp +
            "</h1>",
        };

        

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(error);
            return res.status(500).json({ error: "Failed to send OTP email." });
          }
          return res.json({ message: "OTP sent successfully." });
        });
      }
    );
  },
  // generatedbOTP : ()=>{
  //   const express = require('express');
  //   const router = express.Router();
  //   const nodemailer = require('nodemailer');
  //   const random = require('random');
    
  //   router.post('/ChangePassword', async (req, res) => {
  //     try {
  //       const email = req.body.email;
    
  //       // Check if the user exists
  //       const user = await User.findOne({ email });
  //       if (!user) {
  //         return res.status(404).json(`User with email: ${email} not found`);
  //       }
    
  //       // Generate the OTP
  //       const otp = random.int(1111, 9999);
    
  //       // Send the OTP via email
  //       const transporter = nodemailer.createTransport({
  //         host: 'smtp.gmail.com',
  //         port: 587,
  //         secure: false,
  //         auth: {
  //           user: 'your_email@gmail.com',
  //           pass: 'your_password'
  //         }
  //       });
    
  //       const mailOptions = {
  //         from: 'infoiqraangularecomm@iqratechnology.com',
  //         to: email,
  //         subject: 'Password Assistance',
  //         html: `<h4>To authenticate, please use the following One Time Password(OTP):<br><b><h2>${otp}</h2></b>Don't share this OTP with anyone. Our customer service team will never ask you for your password, OTP, credit card or banking info.<br>We hope to see you again soon.</h4>`
  //       };
    
  //       await transporter.sendMail(mailOptions);
    
  //       // Mark all previous OTPs as used
  //       await PasswordRecovery.updateMany(
  //         { CustomerContacts_Id: user.CustomerContacts_Id },
  //         { IsUsed: true }
  //       );
    
  //       // Save the new OTP to the database
  //       const recovery = new PasswordRecovery({
  //         CustomerContacts_Id: user.CustomerContacts_Id,
  //         OTP: otp,
  //         ValidTill: new Date(Date.now() + 5 * 60 * 1000), // Valid for 5 minutes
  //         GeneratedOn: new Date(),
  //         IsUsed: false
  //       });
    
  //       await recovery.save();
    
  //       return res.status(200).json({
  //         IsUsed: recovery.IsUsed,
  //         GeneratedOn: recovery.GeneratedOn,
  //         ValidTill: recovery.ValidTill,
  //         OTP: recovery.OTP
  //       });
  //     } catch (err) {
  //       console.error(err);
  //       return res.status(500).json('Internal server error');
  //     }
  //   });
  // },
  verifyOtp: (req, res) => {
    const enteredOtp = req.body.otp;
    console.log(enteredOtp,otp, enteredOtp === otp);
    if (!enteredOtp) {
      return res.status(400).json({ error: "OTP is required." });
    }
    if (enteredOtp === parseInt(otp)) {
      return res.status(200).json({ message: "OTP matched." });
    } else {
      return res.status(400).json({ error: "OTP is invalid." });
    }
  },
  resendOtp: (req, res) => {
    const email = req.body.email;
    if (!email) {
      return res.status(400).json({ error: "Email address is required." });
    }
  
    const mailOptions = {
      to: email,
      subject: "OTP for registration is: ",
      html:
        "<h3>OTP for account verification is </h3><h1 style='font-weight:bold;'>" +
        otp +
        "</h1>",
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to send OTP email." });
      }
  
      console.log("Message sent: %s", info.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      return res.json({ message: "OTP sent successfully." });
    });
  },
};
