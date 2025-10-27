const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/get_data_realtime", async (req, res) => {
  try {
    let { dateQuery } = req.body;
    const response = await axios.post(`${process.env.URL_LOCAL_NHT_NAT}/nat/tn/tn-summary/data`, {
      dateQuery,
    });
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
