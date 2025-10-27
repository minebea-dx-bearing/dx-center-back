const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/get_data_realtime", async (req, res) => {
  try {
    const response = await axios.get(`${process.env.URL_LOCAL_NHT_NAT}/nat/gd/2ndinbore-realtime/machines`);
    res.json({
        success: true,
        data: response.data,
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Can't get realtime",
      error: error.message,
    });
  }
});

module.exports = router;
