const express = require("express");
const router = express.Router();
const user_table = require("../model/user");
const bcrypt = require("bcryptjs");
const dbdx = require("../instance/ms_instance_center");
const constance = require("../constance/constance");
router.get("/select", async (req, res) => {
  try {
    let result = await user_table.sequelize.query
      `SELECT [id]
      ,[username]
      ,[empNumber]
      ,[password]
      ,[division]
      ,[levelUser]
      ,[createdAt]
      ,[updatedAt]
  FROM [DX_Center].[dbo].[users]`
    ;
    res.json({ result: result[0], api_result: constance.result_nok });
  } catch (error) {
    res.json({ error, api_result: constance.result_nok });
  }
});
//insert
router.post("/insert", async (req, res) => {
  try {
    req.body.password = bcrypt.hashSync(req.body.password, 8);
    let insert_result = await user_table.create(req.body);
    res.json({ result: insert_result, api_result: constance.result_ok });
  } catch (error) {
    res.json({ result: error, api_result: constance.result_nok });
  }
});
//select 1
router.post("/login", async (req, res) => {
  console.log("test");
  try {
    let db_result = await user_table.findOne({
      where: { empNumber: req.body.empNumber },
    });
    // console.log(db_result);
    if (db_result == null) {
      res.json({
        error: "empNumber_not_found",
        api_result: constance.result_nok,
      });
    } else {
      if (bcrypt.compareSync(req.body.password, db_result.password)) {
        res.json({
          result: db_result,
          api_result: constance.result_ok,
        });
      } else {
        res.json({
          error: "password Fail",
          api_result: constance.result_nok,
        });
      }
    }
  } catch (error) {
    console.log(error);

    res.json({ error, api_result: constance.result_nok });
  }
});
//update CHANGE PASSWORD
router.put("/update", async (req, res) => {
  try {
    req.body.password = bcrypt.hashSync(req.body.password, 8); //convert to hash password แปลงพาสเวิด
    let result = await user_table.update(req.body, {
      where: { empNumber: req.body.empNumber },
    });
    res.json({ result, api_result: constance.result_ok });
  } catch (error) {
    res.json({ error, api_result: constance.result_nok });
  }
});
//Delete
router.patch("/delete", async (req, res) => {
  try {
    let result = await user_table.destroy({
      where: {
        empNumber: req.body.empNumber,
      },
    });
    res.json({ result, api_result: constance.result_ok });
  } catch (error) {
    res.json({ error, api_result: constance.result_nok });
  }
});
//update level (admin or user)
router.put("/level", async (req, res) => {
  try {
    let result = await user_table.update(req.body, {
      where: { username: req.body.username },
    });
    res.json({ result, api_result: constance.result_ok });
  } catch (error) {
    res.json({ error, api_result: constance.result_nok });
  }
});

module.exports = router;