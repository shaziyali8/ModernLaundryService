const express = require("express");
const connection = require("./dbConnection");
const router = express.Router();
const { login, signup, generateOtp, verifyOtp, resendOtp } = require("./auth");

router.post("/generateOtp", generateOtp);
router.get("/verifyOtp", verifyOtp);
router.get("/resendOtp", resendOtp);

router.post("/laundaryLogin", login);
router.post("/laundarySignup", signup);

// router.get("/", (req, res) => {
//   connection.query("Select * from app_fd_tb_usersTable", (err, result) => {
//     res.send(result);
//     err ? err.message : console.log(result);
//   });
// });

router.get("/itemsraw", (req, res) => {
  connection.query(
    `select 
  p.c_price, p.c_emirate, p.c_deliveryType, p.c_service, p.c_item, c_itemID, 
  i.c_item_name, i.c_itemImage, i.c_itemID, i.c_item_cat1,
  em.c_rate_code, em.c_RateCodeID, 
  s.c_serviceID, s.c_serviceName,
  d.c_deliveryTypeID, d.c_delivery_type
  from app_fd_tb_priceList as p
  left join app_fd_tb_items as i
  on  p.c_item  = i.c_itemID
  left join app_fd_tb_ratecodes as em
  on p.c_emirate = em.c_RateCodeID
  left join app_fd_tb_services as s
  on p.c_service = s.c_serviceID
  left join app_fd_tb_DeliveryTypes as d
  on p.c_deliveryType = d.c_deliveryTypeID
  `,
    (err, result) => {
      if (err) {
        console.log(err);
        res.send("error");
      } else {
        res.send(
          result
          // .map((item) => ({
          //   id: item.id,
          //   name: item.c_item_name,
          //   img: item.c_itemImage,
          //   category: item.c_item_cat1,
          //   pricing: [{ "Ras-Al-Khaima": [{}] }],
          // }))
        );
      }
    }
  );
});

router.get("/items", (req, resp) => {
  connection.query(
    `select 
  p.c_price, p.c_emirate, p.c_deliveryType, p.c_service, p.c_item, c_itemID, 
  i.c_item_name, i.c_itemImage, i.c_itemID, i.c_item_cat1,
  em.c_rate_code, em.c_RateCodeID, 
  s.c_serviceID, s.c_serviceName,
  d.c_deliveryTypeID, d.c_delivery_type
  from app_fd_tb_priceList as p
  left join app_fd_tb_items as i
  on  p.c_item  = i.c_itemID
  left join app_fd_tb_ratecodes as em
  on p.c_emirate = em.c_RateCodeID
  left join app_fd_tb_services as s
  on p.c_service = s.c_serviceID
  left join app_fd_tb_DeliveryTypes as d
  on p.c_deliveryType = d.c_deliveryTypeID
  `,
    (err, result) => {
      let recordsets = result.sort(
        (a, b) => (a.c_itemID ?? a.c_item) - (b.c_itemID ?? b.c_item)
      );
      let filteredRecordsets = [];
      if (err) {
        resp.send("error");
      } else {
        for (const record of recordsets) {
          const {
            c_itemID,
            c_item,
            c_item_name,
            c_item_cat1,
            c_itemImage,
            c_RateCodeID,
            c_emirate,
            c_serviceID,
            c_serviceName,
            c_price,
            c_deliveryTypeID,
          } = record;

          const item = filteredRecordsets.find(
            (item) => item.productId == c_itemID ?? c_item
          );
          if (!item) {
            filteredRecordsets.push({
              productId: c_itemID ?? c_item,
              name: c_item_name,
              cat: c_item_cat1,
              img: c_itemImage,
              pricing: [
                {
                  [c_RateCodeID ?? c_emirate]: [
                    {
                      serviceId: c_serviceID,
                      serviceName: c_serviceName,
                      price: c_price,
                      delveryTypeId: c_deliveryTypeID,
                    },
                  ],
                },
              ],
            });
          } else {
            const pricing = item.pricing.find(
              (p) => p[c_RateCodeID ?? c_emirate]
            );
            if (pricing) {
              pricing[c_RateCodeID ?? c_emirate].push({
                serviceId: c_serviceID,
                serviceName: c_serviceName,
                price: c_price,
                delveryTypeId: c_deliveryTypeID,
              });
            } else {
              item.pricing.push({
                [c_RateCodeID ?? c_emirate]: [
                  {
                    serviceId: c_serviceID,
                    serviceName: c_serviceName,
                    price: c_price,
                    delveryTypeId: c_deliveryTypeID,
                  },
                ],
              });
              item.pricing.sort((a, b) =>
                a[c_RateCodeID ?? c_emirate] > b[c_RateCodeID ?? c_emirate]
                  ? 1
                  : -1
              );
            }
          }
        }

        console.log(filteredRecordsets);
        resp.send(filteredRecordsets);
        // filteredRecordsets.map((item) => ({
        //   id: item.id,
        //   name: item.c_item_name,
        //   img: item.c_itemImage,
        //   category: item.c_item_cat1,
        //   pricing: [{ "Ras-Al-Khaima": [{}] }],
        // }))
      }
    }
  );
});

// c_password, c_areaId, c_areacode,address,Apartment id(NOT), c_rate_code_id(NOT)
router.get("/customer", (req, resp) => {
  connection.query("select * from app_fd_tb_customers", (err, result) => {
    console.log(result);
    if (err) {
      resp.send("error");
    } else {
      let dataFilter = result.filter(
        (d) => d.isDeleted !== 0 || d.isDeleted === 0
      );
      resp.send(
        result
        // .map((item) => ({
        //   id: item.id,
        //   email: item.c_email,
        //   // password: item.c_password,
        //   firstname: item.c_firstName,
        //   lastname: item.c_last_name,
        //   c_rate_code_id: item.c_RateCodeID,
        //   c_rate_code: item.c_rate_code,
        //   areaId: item.c_areaId,
        //   // areacode: item.c_areacode,
        //   // address : item.address
        //   // apartment_building : apartment_building,
        //   c_street_name: item.c_street_name,
        //   c_contact_number: item.c_contact_number,
        //   // isDeleted: item.isDeleted,
        // }))
      );
    }
  });
});

router.get("/emirates", (req, res) => {
  connection.query(
    "select c_rate_code, c_RateCodeID from app_fd_tb_ratecodes",
    (err, result) => {
      if (err) {
        res.send("error");
      } else {
        res.send(result);
      }
    }
  );
});

// emirate Id
router.get("/area", (req, res) => {
  connection.query(
    "select c_areaName, c_serialNo, c_emirate from app_fd_tb_area",
    (err, result) => {
      if (err) {
        console.log(err);
        res.send("error");
      } else {
        res.send(result);
      }
    }
  );
});
router.get("/deliverytime", (req, res) => {
  connection.query(
    "select c_deliveryTypeID, c_delivery_type from app_fd_tb_DeliveryTypes",
    (err, result) => {
      if (err) {
        res.send("error");
      } else {
        res.send(result);
      }
    }
  );
});
router.get("/services", (req, res) => {
  connection.query(
    "select c_serviceID, c_serviceName from app_fd_tb_services",
    (err, result) => {
      if (err) {
        res.send("error");
      } else {
        res.send(result);
      }
    }
  );
});

module.exports = router;
