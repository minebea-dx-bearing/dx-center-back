const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/select", async (req, res) => {
  try {
    const response = await axios.get(`${process.env.URL_LOCAL_NHT_NAT}/nat/assy/arp-daily/select`);
    res.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Can't get data from Server",
      error: error.message,
    });
  }
});

router.post("/data", async (req, res) => {
  try {
    let { dateQuery, mcNoQuery } = req.body;
    const response = await axios.post(`${process.env.URL_LOCAL_NHT_NAT}/nat/assy/arp-daily/data`, {
      dateQuery,
      mcNoQuery,
    });
    res.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Can't get data from Server",
      error: error.message,
    });
  }
});

module.exports = router;
