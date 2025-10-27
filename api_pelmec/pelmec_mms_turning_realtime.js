const axios = require("axios");
const express = require("express");
const moment = require("moment");
const router = express.Router();

const url_mms = "http://10.120.115.7:8080";

const lightenColor = (hex, percent) => {
    let num = parseInt(hex.replace("#", ""), 16);
    let r = (num >> 16) + Math.round(((255 - (num >> 16)) * percent) / 100);
    let g = ((num >> 8) & 0x00ff) + Math.round(((255 - ((num >> 8) & 0x00ff)) * percent) / 100);
    let b = (num & 0x0000ff) + Math.round(((255 - (num & 0x0000ff)) * percent) / 100);

    r = Math.min(255, r);
    g = Math.min(255, g);
    b = Math.min(255, b);

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
};

router.get("/select", async (req, res) => {
    try {
        let machineData = await axios.get(`${url_mms}/v2/grouped_signals/by_line`);
        machineData.data.filter((item) => item.signals.length > 0);
        machineData = machineData.data.flatMap((item) => {
            return item.signals.map((signal) => {
                return {
                    mc_no_type: item.name.toUpperCase(),
                    mc_no: signal.name.indexOf(":") > 0 ? signal.name.slice(0, signal.name.indexOf(":")).toUpperCase() : "",
                    number: signal.number,
                };
            });
        });

        let allNumber = machineData.map((item) => item.number).join(",");

        let wholeSignal = await axios.get(`${url_mms}/v4/list/signals/monitors/whole/daily?signal_numbers=${allNumber}`);

        let status = [];
        wholeSignal.data.data.forEach((item) => {
            item.statusSettings.forEach((itemStatus) => {
                let findData = status.find((i) => i === itemStatus.name.toUpperCase());
                if (!findData && itemStatus.name !== "") {
                    status.push(itemStatus.name.toUpperCase());
                }
            });
        });

        status = status.sort((a, b) => a.localeCompare(b));

        const machineType = [...new Set(machineData.map((item) => item.mc_no_type))];

        res.json({
            machineType,
            status,
        });
    } catch (error) {
        console.error(error);
        res.json({
            success: false,
            message: "Can't get data select from MMS",
            error: error.message,
        });
    }
});

router.get("/get_mms", async (req, res) => {
    try {
        let machineData = await axios.get(`${url_mms}/v2/grouped_signals/by_line`);
        machineData.data.filter((item) => item.signals.length > 0);
        machineData = machineData.data.flatMap((item) => {
            return item.signals.map((signal) => {
                return {
                    mc_no_type: item.name.toUpperCase(),
                    mc_no: signal.name.indexOf(":") > 0 ? signal.name.slice(0, signal.name.indexOf(":")).toUpperCase() : signal.name.toUpperCase(),
                    number: signal.number,
                    isEnable: signal.isEnable,
                };
            });
        });

        let allNumber = machineData.map((item) => item.number).join(",");

        let monitorLamp = await axios.get(`${url_mms}/v1/list/signals/monitors/lamp?signal_numbers=${allNumber}`);
        machineData = machineData.map((mcData) => {
            let findData = monitorLamp.data.data.find((i) => i.signalNumber === mcData.number);
            if (findData) {
                return {
                    ...mcData,
                    ...findData,
                };
            } else {
                return {
                    ...mcData,
                };
            }
        });

        let wholeSignal = await axios.get(`${url_mms}/v4/list/signals/monitors/whole/daily?signal_numbers=${allNumber}`);
        machineData = machineData.map((mcData) => {
            let findData = wholeSignal.data.data.find((i) => i.number === mcData.number);

            if (findData) {
                findStatus = findData.statusSettings.find(
                    (i) => i.red === mcData.red && i.yellow === mcData.yellow && i.green === mcData.green && i.blue === mcData.blue
                );
                if (findStatus) {
                    return {
                        ...mcData,
                        partNo: findData.currentModel ? findData.currentModel.name : null,
                        status: findStatus.name.toUpperCase(),
                        rgbColor: findStatus.rgbColor,
                    };
                } else {
                    return {
                        ...mcData,
                        partNo: findData.currentModel ? findData.currentModel.name : null,
                        status: null,
                    };
                }
            }
        });

        machineData = machineData.filter(Boolean).filter((item) => item.isEnable);

        // ปรับสีให้อ่อนลง 80%
        machineData = machineData.map((item) => {
            if (item.rgbColor) {
                return {
                    ...item,
                    rgbColor: lightenColor(item.rgbColor, 90),
                };
            } else {
                return {
                    ...item,
                    rgbColor: null,
                };
            }
        });

        machineData = machineData.map((item) => {
            let duration = moment.duration(item.receivedAt - item.startedAt, "seconds");
            let hours = Math.floor(duration.asHours());
            let minutes = duration.minutes().toString().padStart(2, "0");
            return {
                ...item,
                startStatus: moment.unix(item.startedAt).format("HH:mm"),
                diffTime: `${hours}:${minutes}`,
            };
        });

        // ถ้า signal เป็น disconnected ให้ขึ้นว่า SIGNAL LAMP ERROR
        machineData = machineData.map((item) => {
            if (item.red === "disconnected" && item.yellow === "disconnected" && item.green === "disconnected" && item.blue === "disconnected") {
                return {
                    ...item,
                    status: "SIGNAL LAMP ERROR",
                };
            } else {
                return {
                    ...item,
                };
            }
        });

        res.json({
            success: true,
            machineData,
        });
    } catch (error) {
        console.error(error);
        res.json({
            success: false,
            message: "Can't get data from MMS",
            error: error.message,
        });
    }
});

module.exports = router;
