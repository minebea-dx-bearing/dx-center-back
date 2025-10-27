const express = require("express");
const moment = require("moment");
const router = express.Router();
const dbms = require("../instance/ms_instance_nmb");
const schedule = require("node-schedule");
const currentIP = require("../util/check_current_ip");
const get_data_mms = require("../util/get_data_mms");

const masterColor = [
    { name: "M/C RUN", color: "#00b005" },
    { name: "WORK CHECK", color: "#0070C0" },
    { name: "TOOL COUNTER UP", color: "#00FF00" },
    { name: "M/C STOP", color: "#FF0000" },
    { name: "POS4. 6", color: "#FD9803" },
    { name: "M/C ALARM", color: "#FFC000" },
    { name: "NO WORK", color: "#FFFF00" },
    { name: "PARTS DROP", color: "#FF3399" },
    { name: "WORM UP", color: "#E46C0A" },
    { name: "ADJ BIT", color: "#93CDDD" },
    { name: "M/M", color: "#31859C" },
    { name: "SET UP", color: "#ACA2C7" },
    { name: "ADJ MC", color: "#8064A2" },
    { name: "Other", color: "#595959" },
    { name: "No signal", color: "#A6A6A6" },
    { name: "Signal Lamp error", color: "#D9D9D9" },
    { name: "Break time", color: "#0000FF" },
    { name: "SCOPE CHECK", color: "#7DFF00" },
];

const url_mms = "http://10.120.115.7:8080";
const db_direction = "[mms].[dbo].[pelmec_turning]";

let job = schedule.scheduleJob("7,17,27,37,47,57 * * * *", async () => {
  if (currentIP.includes("10.120.10.140")) {
    await get_data_mms(url_mms, dbms, db_direction);
    console.log(`Running task update data MMS : ${moment().format("YYYY-MM-DD HH:mm:ss")}`);
  }
});

router.get("/get_data_mms", async (req, res) => {
  try {
    const getDataMms = await get_data_mms(url_mms, dbms, db_direction);
    res.json({
      success: true,
      message: "Update database finish",
      getDataMms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Can't get data MMS",
      error: error.message,
    });
  }
});

router.post("/select", async (req, res) => {
  try {
    let { startDateQuery, endDateQuery } = req.body;

    let resultSelect = await dbms.query(
      `
                SELECT DISTINCT
                    [shift]
                    ,[mc_type]
                    ,[mc_type] AS [mc_type_group]
                    ,[mc_no]
                FROM ${db_direction}
                WHERE [date] BETWEEN '${startDateQuery}' AND '${endDateQuery}'
            `
    );
    if (resultSelect[1] > 0) {
      res.json({
        success: true,
        resultSelect: resultSelect[0],
      });
    } else {
      console.log("don't found data select");
      res.json({
        success: false,
        message: "Don't found data select",
      });
    }
  } catch (error) {
    console.error(error);
    res.json({
      success: false,
      message: "Can't get data select from database",
      error: error.message,
    });
  }
});

router.post("/status", async (req, res) => {
  try {
    let {
      startDateQuery,
      endDateQuery,
      shiftQuery = "ALL",
      machineTypeGroupQuery = "ALL",
      machineTypeQuery = "ALL",
      machineNoQuery = "ALL",
      percentQuery = 0,
    } = req.body;

    if (shiftQuery.length === 0) {
      shiftQuery = "ALL";
    }
    if (machineTypeGroupQuery.length === 0) {
      machineTypeGroupQuery = "ALL";
    }
    if (machineTypeQuery.length === 0) {
      machineTypeQuery = "ALL";
    }
    if (machineNoQuery.length === 0) {
      machineNoQuery = "ALL";
    }

    let totalStatus = await dbms.query(
      `
        SELECT
            [registered]
            ,[date]
            ,[shift]
            ,[mc_type]
            ,[mc_type] AS [mc_type_group]
            ,[mc_no]
            ,[part_no]
            ,ROUND([cycle_time_target] / [ring_type], 2) AS [cycle_time_target]
            ,ROUND([cycle_time_actual] / [ring_type], 2) AS [cycle_time_actual]
            ,[prod_target]
            ,[prod_result]
            ,[prod_ng]
            ,[monitoring_time]
            ,[uptime_sec]
            ,[name_0]
            ,[duration_0]
            ,[count_0]
            ,[name_1]
            ,[duration_1]
            ,[count_1]
            ,[name_2]
            ,[duration_2]
            ,[count_2]
            ,[name_3]
            ,[duration_3]
            ,[count_3]
            ,[name_4]
            ,[duration_4]
            ,[count_4]
            ,[name_5]
            ,[duration_5]
            ,[count_5]
            ,[name_6]
            ,[duration_6]
            ,[count_6]
            ,[name_7]
            ,[duration_7]
            ,[count_7]
            ,[name_8]
            ,[duration_8]
            ,[count_8]
            ,[name_9]
            ,[duration_9]
            ,[count_9]
            ,[name_10]
            ,[duration_10]
            ,[count_10]
            ,[name_11]
            ,[duration_11]
            ,[count_11]
            ,[name_12]
            ,[duration_12]
            ,[count_12]
            ,[name_13]
            ,[duration_13]
            ,[count_13]
            ,[name_14]
            ,[duration_14]
            ,[count_14]
            ,[name_15]
            ,[duration_15]
            ,[count_15]
            ,[name_16]
            ,[duration_16]
            ,[count_16]
            ,[name_17]
            ,[duration_17]
            ,[count_17]
            ,[name_18]
            ,[duration_18]
            ,[count_18]
            ,[name_19]
            ,[duration_19]
            ,[count_19]
            ,[name_20]
            ,[duration_20]
            ,[count_20]
            ,[name_21]
            ,[duration_21]
            ,[count_21]
            ,[name_22]
            ,[duration_22]
            ,[count_22]
            ,[name_23]
            ,[duration_23]
            ,[count_23]
            ,[name_24]
            ,[duration_24]
            ,[count_24]
            ,[name_25]
            ,[duration_25]
            ,[count_25]
            ,[name_26]
            ,[duration_26]
            ,[count_26]
            ,[name_27]
            ,[duration_27]
            ,[count_27]
            ,[name_28]
            ,[duration_28]
            ,[count_28]
            ,[name_29]
            ,[duration_29]
            ,[count_29]
            ,[name_30]
            ,[duration_30]
            ,[count_30]
            ,[name_31]
            ,[duration_31]
            ,[count_31]
            ,[name_32]
            ,[duration_32]
            ,[count_32]
            ,[name_33]
            ,[duration_33]
            ,[count_33]
            ,[name_34]
            ,[duration_34]
            ,[count_34]
            ,[name_35]
            ,[duration_35]
            ,[count_35]
            ,[name_36]
            ,[duration_36]
            ,[count_36]
            ,[name_37]
            ,[duration_37]
            ,[count_37]
            ,[name_38]
            ,[duration_38]
            ,[count_38]
            ,[name_39]
            ,[duration_39]
            ,[count_39]
            ,[name_40]
            ,[duration_40]
            ,[count_40]
            ,[name_41]
            ,[duration_41]
            ,[count_41]
            ,[name_42]
            ,[duration_42]
            ,[count_42]
            ,[name_43]
            ,[duration_43]
            ,[count_43]
            ,[name_44]
            ,[duration_44]
            ,[count_44]
        FROM ${db_direction}
        WHERE [date] BETWEEN '${startDateQuery}' AND '${endDateQuery}'
        ORDER BY
            [date]
            ,[mc_type]
            ,[mc_no]
            ,[shift]
      `
    );

    if (totalStatus[1] > 0) {
      totalStatus = totalStatus[0].map((item) => {
        const nameDurations = [];

        for (let i = 0; i < 44; i++) {
          const nameKey = `name_${i}`;
          const durationKey = `duration_${i}`;
          const countKey = `count_${i}`;

          if (item[nameKey] !== null && item[nameKey] !== undefined) {
            nameDurations.push({
              name: item[nameKey],
              duration: item[durationKey] || 0,
              count: item[countKey] || 0,
              prod_lose: parseInt((item[durationKey] / item.monitoring_time) * item.prod_target),
              color: masterColor.find((i) => i.name.toUpperCase() === item[nameKey].toUpperCase())?.color || "#464646",
            });
          }

          delete item[nameKey];
          delete item[durationKey];
          delete item[countKey];
        }

        return {
          ...item,
          month: moment(item.date).format("MMM"),
          nameDurations,
        };
      });

      // filter
      if (!shiftQuery.includes("ALL")) {
        totalStatus = totalStatus.filter((item) => shiftQuery.includes(item.shift));
      }
      if (!machineTypeGroupQuery.includes("ALL")) {
        totalStatus = totalStatus.filter((item) => machineTypeGroupQuery.includes(item.mc_type_group));
      }
      if (!machineTypeQuery.includes("ALL")) {
        totalStatus = totalStatus.filter((item) => machineTypeQuery.includes(item.mc_type));
      }
      if (!machineNoQuery.includes("ALL")) {
        totalStatus = totalStatus.filter((item) => machineNoQuery.includes(item.mc_no));
      }

      const maxRegistered = moment(totalStatus.reduce((max, curr) => {
        return curr.registered > max ? curr.registered : max;
      }, totalStatus[0].registered)).utc().format("YYYY-MM-DD HH:mm:ss");

      // เก็บ master item ต่างๆ
      let date = [...new Set(totalStatus.map((item) => item.date))];
      let month = [...new Set(totalStatus.map((item) => item.month))];
      let mc_type_group = [...new Set(totalStatus.map((item) => item.mc_type_group))];
      let mc_type = [...new Set(totalStatus.map((item) => item.mc_type))];
      let mc_no = [...new Set(totalStatus.map((item) => item.mc_no))];
      date = date.sort((a, b) => a.localeCompare(b));

      // utili < select = not working day
      let workingDay = date
        .map((item_date) => {
          const filteredData = totalStatus.filter((item) => item.date === item_date);

          const totalUptime = filteredData.reduce((sum, curr) => sum + curr.uptime_sec, 0);
          const totalMonitoring = filteredData.reduce((sum, curr) => sum + curr.monitoring_time, 0);

          const utili = totalMonitoring > 0 ? parseFloat(((totalUptime / totalMonitoring) * 100).toFixed(1)) : 0;

          if (utili > 10) {
            return item_date;
          } else {
            return null;
          }
        })
        .filter(Boolean);

      workingDay = workingDay.sort((a, b) => a.localeCompare(b));

      totalStatus = totalStatus
        .map((item) => {
          let findData = workingDay.find((i) => i === item.date);
          if (findData) {
            return {
              ...item,
            };
          } else {
            null;
          }
        })
        .filter(Boolean);

      let tableTotal_daily = [];
      totalStatus.forEach((item) => {
        const existing = tableTotal_daily.find((i) => i.date === item.date && i.mc_no === item.mc_no && i.part_no === item.part_no);

        if (existing) {
          existing.prod_target += item.prod_target;
          existing.prod_result += item.prod_result;
          existing.prod_ng += item.prod_ng;
          existing.cycle_time_target_sumReciprocal += 1 / item.cycle_time_target;
          existing.cycle_time_actual_sumReciprocal += 1 / item.cycle_time_actual;
          existing.monitoring_time += item.monitoring_time;
          existing.uptime_sec += item.uptime_sec;
          existing.count += 1;
          item.nameDurations.forEach((nd) => {
            const match = existing.nameDurations.find((e) => e.name === nd.name);
            if (match) {
              match.duration += nd.duration;
              match.count += nd.count;
              match.prod_lose += nd.prod_lose;
            } else {
              // ถ้ายังไม่มี name นี้ ให้เพิ่มเข้าไป
              existing.nameDurations.push({ ...nd });
            }
          });
        } else {
          tableTotal_daily.push({
            date: item.date,
            month: item.month,
            mc_type: item.mc_type,
            mc_type_group: item.mc_type_group,
            mc_no: item.mc_no,
            part_no: item.part_no,
            prod_target: item.prod_target,
            prod_result: item.prod_result,
            prod_ng: item.prod_ng,
            cycle_time_target_sumReciprocal: 1 / item.cycle_time_target,
            cycle_time_actual_sumReciprocal: 1 / item.cycle_time_actual,
            monitoring_time: item.monitoring_time,
            uptime_sec: item.uptime_sec,
            count: 1,
            nameDurations: item.nameDurations.map((nd) => ({ ...nd })),
          });
        }
      });

      tableTotal_daily = tableTotal_daily.map((item) => {
        return {
          ...item,
          yield: Number(((item.prod_result - item.prod_ng) / item.prod_result * 100).toFixed(2)),
          cycle_time_target_sumReciprocal: parseFloat(item.cycle_time_target_sumReciprocal.toFixed(2)),
          cycle_time_actual_sumReciprocal: parseFloat(item.cycle_time_actual_sumReciprocal.toFixed(2)),
          cycle_time_target: parseFloat((item.count / item.cycle_time_target_sumReciprocal).toFixed(2)),
          cycle_time_actual: parseFloat((item.count / item.cycle_time_actual_sumReciprocal).toFixed(2)),
          opn_rate: Number(((item.uptime_sec / item.monitoring_time) * 100).toFixed(1)),
        };
      });

      tableTotal_daily = tableTotal_daily.map((item) => {
        return {
          ...item,
          prod_diff: item.prod_result - item.prod_target,
          cycle_time_diff: parseFloat((item.cycle_time_target - item.cycle_time_actual).toFixed(2)),
        };
      });

      // ประกาศตัวแปร
      let chart_production = {
        categories: workingDay,
        series: [],
      };
      let chart_operation_rate = {
        categories: workingDay,
        series: [],
      };
      let chart_cycle_time = {
        categories: workingDay,
        series: [],
      };
      let chart_alarm_time = {
        categories: workingDay,
        series: [],
      };
      let chart_alarm_time_lose = {
        categories: workingDay,
        series: [],
      };

      // ==============================================

      let chart_production_group = {
        categories: workingDay,
        series: [],
      };
      let chart_operation_rate_group = {
        categories: workingDay,
        series: [],
      };
      let chart_cycle_time_group = {
        categories: workingDay,
        series: [],
      };

      // ==============================================

      let chart_production_month = {
        categories: month,
        series: [],
      };
      let chart_production_month_avg = {
        categories: month,
        series: [],
      };
      let chart_operation_rate_month = {
        categories: month,
        series: [],
      };
      let chart_cycle_time_month = {
        categories: month,
        series: [],
      };
      let chart_alarm_time_month = {
        categories: month,
        series: [],
      };
      let chart_alarm_time_month_avg = {
        categories: month,
        series: [],
      };
      let chart_alarm_time_month_lose = {
        categories: month,
        series: [],
      };
      let chart_alarm_time_month_lose_avg = {
        categories: month,
        series: [],
      };

      // ==============================================

      let chart_production_group_month = {
        categories: month,
        series: [],
      };
      let chart_production_group_month_avg = {
        categories: month,
        series: [],
      };
      let chart_operation_rate_group_month = {
        categories: month,
        series: [],
      };
      let chart_cycle_time_group_month = {
        categories: month,
        series: [],
      };

      // ==============================================

      let chart_prod_machine = {
        categories: mc_no,
        series: [],
      };
      let chart_opn_machine = {
        categories: mc_no,
        series: [],
      };
      let chart_cycletime_machine = {
        categories: mc_no,
        series: [],
      };
      let chart_alarm_time_machine = {
        categories: mc_no,
        series: [],
      };
      let chart_alarm_time_machine_lose = {
        categories: mc_no,
        series: [],
      };

      // ==============================================

      chart_production.series = [
        ...mc_type.map((item_mc_type) => ({
          name: item_mc_type,
          type: "bar",
          stack: "total",
          data: workingDay.map((item_date) =>
            totalStatus.filter((item) => item.date === item_date && item.mc_type === item_mc_type).reduce((sum, curr) => sum + curr.prod_result, 0)
          ),
        })),
        {
          name: "Total",
          type: "scatter",
          symbolSize: 0,
          color: "black",
          data: workingDay.map((item_date) => totalStatus.filter((item) => item.date === item_date).reduce((sum, curr) => sum + curr.prod_result, 0)),
        },
        {
          name: "Capacity",
          type: "line",
          color: "red",
          data: workingDay.map((item_date) => totalStatus.filter((item) => item.date === item_date).reduce((sum, curr) => sum + curr.prod_target, 0)),
        },
      ];

      chart_operation_rate.series = [
        ...mc_type.map((item_mc_type) => ({
          name: item_mc_type,
          type: "bar",
          data: workingDay.map((item_date) => {
            const filteredData = tableTotal_daily.filter(
              (item) => item.date === item_date && item.mc_type === item_mc_type && item.monitoring_time * percentQuery < item.uptime_sec
            );

            const totalOpn = filteredData.reduce((sum, curr) => sum + curr.opn_rate, 0);
            const n = filteredData.length;

            return n > 0 ? parseFloat((totalOpn / n).toFixed(1)) : 0;
          }),
        })),
        {
          name: "AVG.",
          type: "line",
          color: "black",
          data: workingDay.map((item_date) => {
            const filteredData = tableTotal_daily.filter((item) => item.date === item_date && item.monitoring_time * percentQuery < item.uptime_sec);

            const totalOpn = filteredData.reduce((sum, curr) => sum + curr.opn_rate, 0);
            const n = filteredData.length;

            return n > 0 ? parseFloat((totalOpn / n).toFixed(1)) : 0;
          }),
        },
      ];

      chart_cycle_time.series = [
        ...mc_type.map((item_mc_type) => ({
          name: item_mc_type,
          type: "bar",
          data: workingDay.map((item_date) => {
            const filteredData = totalStatus.filter((item) => item.date === item_date && item.mc_type === item_mc_type && item.cycle_time_actual);
            const n = filteredData.length;
            const harmonicSum = filteredData.reduce((sum, curr) => sum + 1 / curr.cycle_time_actual, 0);

            return n > 0 ? parseFloat((n / harmonicSum).toFixed(2)) : 0;
          }),
        })),
        {
          name: "Harmonic",
          type: "line",
          color: "black",
          data: workingDay.map((item_date) => {
            const filteredData = totalStatus.filter((item) => item.date === item_date && item.cycle_time_actual);
            const n = filteredData.length;
            const harmonicSum = filteredData.reduce((sum, curr) => sum + 1 / curr.cycle_time_actual, 0);

            return n > 0 ? parseFloat((n / harmonicSum).toFixed(2)) : 0;
          }),
        },
        {
          name: "Target (Harmonic)",
          type: "line",
          color: "red",
          data: workingDay.map((item_date) => {
            const filteredData = totalStatus.filter((item) => item.date === item_date && item.cycle_time_target);
            const n = filteredData.length;
            const harmonicSum = filteredData.reduce((sum, curr) => sum + 1 / curr.cycle_time_target, 0);

            return n > 0 ? parseFloat((n / harmonicSum).toFixed(2)) : 0;
          }),
        },
      ];

      const alarm_date = {};
      const alarm_date_lose = {};

      totalStatus.forEach((item) => {
        const date = item.date;

        item.nameDurations.forEach((nd) => {
          const key = nd.name;
          if (!alarm_date[key]) {
            alarm_date[key] = {};
            alarm_date_lose[key] = {};
          }

          if (!alarm_date[key][date]) {
            alarm_date[key][date] = 0;
            alarm_date_lose[key][date] = 0;
          }

          alarm_date[key][date] += nd.duration;
          alarm_date_lose[key][date] += nd.prod_lose;
        });
      });

      chart_alarm_time.series = Object.entries(alarm_date).map(([name, dateMap]) => {
        return {
          name,
          type: "bar",
          stack: "total",
          color: masterColor.find((i) => i.name.toUpperCase() === name.toUpperCase())?.color || "#464646",
          data: workingDay.map((date) => dateMap[date] || 0),
        };
      });

      chart_alarm_time_lose.series = Object.entries(alarm_date_lose).map(([name, dateMap]) => {
        return {
          name,
          type: "bar",
          stack: "total",
          color: masterColor.find((i) => i.name.toUpperCase() === name.toUpperCase())?.color || "#464646",
          data: workingDay.map((date) => dateMap[date] || 0),
        };
      });

      // ==============================================

      chart_production_month.series = [
        ...mc_type.map((item_mc_type) => ({
          name: item_mc_type,
          type: "bar",
          stack: "total",
          data: month.map((item_month) =>
            totalStatus.filter((item) => item.month === item_month && item.mc_type === item_mc_type).reduce((sum, curr) => sum + curr.prod_result, 0)
          ),
        })),
        {
          name: "Total",
          type: "scatter",
          symbolSize: 0,
          color: "black",
          data: month.map((item_month) => totalStatus.filter((item) => item.month === item_month).reduce((sum, curr) => sum + curr.prod_result, 0)),
        },
        {
          name: "Capacity",
          type: "line",
          color: "red",
          data: month.map((item_month) => totalStatus.filter((item) => item.month === item_month).reduce((sum, curr) => sum + curr.prod_target, 0)),
        },
      ];

      chart_production_month_avg.series = [
        ...mc_type.map((item_mc_type) => ({
          name: item_mc_type,
          type: "bar",
          stack: "total",
          data: month.map((item_month) => {
            const filtered = totalStatus.filter((item) => item.month === item_month && item.mc_type === item_mc_type);
            const countDate = [...new Set(filtered.map((item) => item.date))].length;
            const total = filtered.reduce((sum, curr) => sum + curr.prod_result, 0);
            return filtered.length > 0 ? parseFloat((total / countDate).toFixed(1)) : 0;
          }),
        })),
        {
          name: "Total",
          type: "scatter",
          symbolSize: 0,
          color: "black",
          data: month.map((item_month) => {
            const filtered = totalStatus.filter((item) => item.month === item_month);
            const countDate = [...new Set(filtered.map((item) => item.date))].length;
            const total = filtered.reduce((sum, curr) => sum + curr.prod_result, 0);
            return filtered.length > 0 ? parseFloat((total / countDate).toFixed(1)) : 0;
          }),
        },
        {
          name: "Capacity",
          type: "line",
          color: "red",
          data: month.map((item_month) => {
            const filtered = totalStatus.filter((item) => item.month === item_month);
            const countDate = [...new Set(filtered.map((item) => item.date))].length;
            const total = filtered.reduce((sum, curr) => sum + curr.prod_target, 0);
            return filtered.length > 0 ? parseFloat((total / countDate).toFixed(1)) : 0;
          }),
        },
      ];

      chart_operation_rate_month.series = [
        ...mc_type.map((item_mc_type) => ({
          name: item_mc_type,
          type: "bar",
          data: month.map((item_month) => {
            const filteredData = tableTotal_daily.filter(
              (item) => item.month === item_month && item.mc_type === item_mc_type && item.monitoring_time * percentQuery < item.uptime_sec
            );

            const totalOpn = filteredData.reduce((sum, curr) => sum + curr.opn_rate, 0);
            const n = filteredData.length;

            return n > 0 ? parseFloat((totalOpn / n).toFixed(1)) : 0;
          }),
        })),
        {
          name: "AVG.",
          type: "line",
          color: "black",
          data: month.map((item_month) => {
            const filteredData = tableTotal_daily.filter((item) => item.month === item_month && item.monitoring_time * percentQuery < item.uptime_sec);

            const totalOpn = filteredData.reduce((sum, curr) => sum + curr.opn_rate, 0);
            const n = filteredData.length;

            return n > 0 ? parseFloat((totalOpn / n).toFixed(1)) : 0;
          }),
        },
      ];

      chart_cycle_time_month.series = [
        ...mc_type.map((item_mc_type) => ({
          name: item_mc_type,
          type: "bar",
          data: month.map((item_month) => {
            const filteredData = totalStatus.filter((item) => item.month === item_month && item.mc_type === item_mc_type && item.cycle_time_actual);
            const n = filteredData.length;
            const harmonicSum = filteredData.reduce((sum, curr) => sum + 1 / curr.cycle_time_actual, 0);

            return n > 0 ? parseFloat((n / harmonicSum).toFixed(2)) : 0;
          }),
        })),
        {
          name: "Harmonic",
          type: "line",
          color: "black",
          data: month.map((item_month) => {
            const filteredData = totalStatus.filter((item) => item.month === item_month && item.cycle_time_actual);
            const n = filteredData.length;
            const harmonicSum = filteredData.reduce((sum, curr) => sum + 1 / curr.cycle_time_actual, 0);

            return n > 0 ? parseFloat((n / harmonicSum).toFixed(2)) : 0;
          }),
        },
        {
          name: "Target (Harmonic)",
          type: "line",
          color: "red",
          data: month.map((item_month) => {
            const filteredData = totalStatus.filter((item) => item.month === item_month && item.cycle_time_actual);
            const n = filteredData.length;
            const harmonicSum = filteredData.reduce((sum, curr) => sum + 1 / curr.cycle_time_target, 0);

            return n > 0 ? parseFloat((n / harmonicSum).toFixed(2)) : 0;
          }),
        },
      ];

      const alarm_month = {};
      const alarm_month_lose = {};
      const alarm_month_count = {};
      const alarm_month_lose_count = {};

      tableTotal_daily.forEach((item) => {
        const month = item.month;

        item.nameDurations.forEach((nd) => {
          const key = nd.name;

          // Initialize structures
          if (!alarm_month[key]) {
            alarm_month[key] = {};
            alarm_month_lose[key] = {};
            alarm_month_count[key] = {};
            alarm_month_lose_count[key] = {};
          }

          if (!alarm_month[key][month]) {
            alarm_month[key][month] = 0;
            alarm_month_lose[key][month] = 0;
            alarm_month_count[key][month] = 0;
            alarm_month_lose_count[key][month] = 0;
          }

          // Sum values
          alarm_month[key][month] += nd.duration;
          alarm_month_lose[key][month] += nd.prod_lose;

          // Count occurrences
          alarm_month_count[key][month] += 1;
          alarm_month_lose_count[key][month] += 1;
        });
      });

      chart_alarm_time_month.series = Object.entries(alarm_month).map(([name, monthMap]) => {
        return {
          name,
          type: "bar",
          stack: "total",
          color: masterColor.find((i) => i.name.toUpperCase() === name.toUpperCase())?.color || "#464646",
          data: month.map((month) => monthMap[month] || 0),
        };
      });

      chart_alarm_time_month_lose.series = Object.entries(alarm_month_lose).map(([name, monthMap]) => {
        return {
          name,
          type: "bar",
          stack: "total",
          color: masterColor.find((i) => i.name.toUpperCase() === name.toUpperCase())?.color || "#464646",
          data: month.map((month) => monthMap[month] || 0),
        };
      });

      chart_alarm_time_month_avg.series = Object.entries(alarm_month).map(([name, monthMap]) => {
        const countMap = alarm_month_count[name];
        return {
          name,
          type: "bar",
          stack: "total",
          color: masterColor.find((i) => i.name.toUpperCase() === name.toUpperCase())?.color || "#464646",
          data: month.map((m) => {
            const total = monthMap[m] || 0;
            const count = countMap[m] || 0;
            return count > 0 ? Math.round(total / count) : 0;
          }),
        };
      });

      chart_alarm_time_month_lose_avg.series = Object.entries(alarm_month_lose).map(([name, monthMap]) => {
        const countMap = alarm_month_lose_count[name];
        return {
          name,
          type: "bar",
          stack: "total",
          color: masterColor.find((i) => i.name.toUpperCase() === name.toUpperCase())?.color || "#464646",
          data: month.map((m) => {
            const total = monthMap[m] || 0;
            const count = countMap[m] || 0;
            return count > 0 ? Math.round(total / count) : 0;
          }),
        };
      });

      // ==============================================

      chart_production_group.series = [
        ...mc_type_group.map((item_mc_type_group) => ({
          name: item_mc_type_group,
          type: "bar",
          stack: "total",
          data: workingDay.map((item_date) =>
            totalStatus
              .filter((item) => item.date === item_date && item.mc_type_group === item_mc_type_group)
              .reduce((sum, curr) => sum + curr.prod_result, 0)
          ),
        })),
        {
          name: "Total",
          type: "scatter",
          symbolSize: 0,
          color: "black",
          data: workingDay.map((item_date) => totalStatus.filter((item) => item.date === item_date).reduce((sum, curr) => sum + curr.prod_result, 0)),
        },
        {
          name: "Capacity",
          type: "line",
          color: "red",
          data: workingDay.map((item_date) => totalStatus.filter((item) => item.date === item_date).reduce((sum, curr) => sum + curr.prod_target, 0)),
        },
      ];

      chart_operation_rate_group.series = [
        ...mc_type_group.map((item_mc_type_group) => ({
          name: item_mc_type_group,
          type: "bar",
          data: workingDay.map((item_date) => {
            const filteredData = tableTotal_daily.filter(
              (item) => item.date === item_date && item.mc_type_group === item_mc_type_group && item.monitoring_time * percentQuery < item.uptime_sec
            );

            const totalOpn = filteredData.reduce((sum, curr) => sum + curr.opn_rate, 0);
            const n = filteredData.length;

            return n > 0 ? parseFloat((totalOpn / n).toFixed(1)) : 0;
          }),
        })),
        {
          name: "AVG.",
          type: "line",
          color: "black",
          data: workingDay.map((item_date) => {
            const filteredData = tableTotal_daily.filter((item) => item.date === item_date && item.monitoring_time * percentQuery < item.uptime_sec);

            const totalOpn = filteredData.reduce((sum, curr) => sum + curr.opn_rate, 0);
            const n = filteredData.length;

            return n > 0 ? parseFloat((totalOpn / n).toFixed(1)) : 0;
          }),
        },
      ];

      chart_cycle_time_group.series = [
        ...mc_type_group.map((item_mc_type_group) => ({
          name: item_mc_type_group,
          type: "bar",
          data: workingDay.map((item_date) => {
            const filteredData = totalStatus.filter(
              (item) => item.date === item_date && item.mc_type_group === item_mc_type_group && item.cycle_time_actual
            );
            const n = filteredData.length;
            const harmonicSum = filteredData.reduce((sum, curr) => sum + 1 / curr.cycle_time_actual, 0);

            return n > 0 ? parseFloat((n / harmonicSum).toFixed(2)) : 0;
          }),
        })),
        {
          name: "Harmonic",
          type: "line",
          color: "black",
          data: workingDay.map((item_date) => {
            const filteredData = totalStatus.filter((item) => item.date === item_date && item.cycle_time_actual);
            const n = filteredData.length;
            const harmonicSum = filteredData.reduce((sum, curr) => sum + 1 / curr.cycle_time_actual, 0);

            return n > 0 ? parseFloat((n / harmonicSum).toFixed(2)) : 0;
          }),
        },
        {
          name: "Target (Harmonic)",
          type: "line",
          color: "red",
          data: workingDay.map((item_date) => {
            const filteredData = totalStatus.filter((item) => item.date === item_date && item.cycle_time_target);
            const n = filteredData.length;
            const harmonicSum = filteredData.reduce((sum, curr) => sum + 1 / curr.cycle_time_target, 0);

            return n > 0 ? parseFloat((n / harmonicSum).toFixed(2)) : 0;
          }),
        },
      ];

      // ==============================================

      chart_production_group_month.series = [
        ...mc_type_group.map((item_mc_type_group) => ({
          name: item_mc_type_group,
          type: "bar",
          stack: "total",
          data: month.map((item_month) =>
            totalStatus
              .filter((item) => item.month === item_month && item.mc_type_group === item_mc_type_group)
              .reduce((sum, curr) => sum + curr.prod_result, 0)
          ),
        })),
        {
          name: "Total",
          type: "scatter",
          symbolSize: 0,
          color: "black",
          data: month.map((item_month) => totalStatus.filter((item) => item.month === item_month).reduce((sum, curr) => sum + curr.prod_result, 0)),
        },
        {
          name: "Capacity",
          type: "line",
          color: "red",
          data: month.map((item_month) => totalStatus.filter((item) => item.month === item_month).reduce((sum, curr) => sum + curr.prod_target, 0)),
        },
      ];

      chart_production_group_month_avg.series = [
        ...mc_type_group.map((item_mc_type_group) => ({
          name: item_mc_type_group,
          type: "bar",
          stack: "total",
          data: month.map((item_month) => {
            const filtered = totalStatus.filter((item) => item.month === item_month && item.mc_type_group === item_mc_type_group);
            const countDate = [...new Set(filtered.map((item) => item.date))].length;
            const total = filtered.reduce((sum, curr) => sum + curr.prod_result, 0);
            return filtered.length > 0 ? parseFloat((total / countDate).toFixed(1)) : 0;
          }),
        })),
        {
          name: "Total",
          type: "scatter",
          symbolSize: 0,
          color: "black",
          data: month.map((item_month) => {
            const filtered = totalStatus.filter((item) => item.month === item_month);
            const countDate = [...new Set(filtered.map((item) => item.date))].length;
            const total = filtered.reduce((sum, curr) => sum + curr.prod_result, 0);
            return filtered.length > 0 ? parseFloat((total / countDate).toFixed(1)) : 0;
          }),
        },
        {
          name: "Capacity",
          type: "line",
          color: "red",
          data: month.map((item_month) => {
            const filtered = totalStatus.filter((item) => item.month === item_month);
            const countDate = [...new Set(filtered.map((item) => item.date))].length;
            const total = filtered.reduce((sum, curr) => sum + curr.prod_target, 0);
            return filtered.length > 0 ? parseFloat((total / countDate).toFixed(1)) : 0;
          }),
        },
      ];

      chart_operation_rate_group_month.series = [
        ...mc_type_group.map((item_mc_type_group) => ({
          name: item_mc_type_group,
          type: "bar",
          data: month.map((item_month) => {
            const filteredData = tableTotal_daily.filter(
              (item) => item.month === item_month && item.mc_type_group === item_mc_type_group && item.monitoring_time * percentQuery < item.uptime_sec
            );

            const totalOpn = filteredData.reduce((sum, curr) => sum + curr.opn_rate, 0);
            const n = filteredData.length;

            return n > 0 ? parseFloat((totalOpn / n).toFixed(1)) : 0;
          }),
        })),
        {
          name: "AVG.",
          type: "line",
          color: "black",
          data: month.map((item_month) => {
            const filteredData = tableTotal_daily.filter((item) => item.month === item_month && item.monitoring_time * percentQuery < item.uptime_sec);

            const totalOpn = filteredData.reduce((sum, curr) => sum + curr.opn_rate, 0);
            const n = filteredData.length;

            return n > 0 ? parseFloat((totalOpn / n).toFixed(1)) : 0;
          }),
        },
      ];

      chart_cycle_time_group_month.series = [
        ...mc_type_group.map((item_mc_type_group) => ({
          name: item_mc_type_group,
          type: "bar",
          data: month.map((item_month) => {
            const filteredData = totalStatus.filter(
              (item) => item.month === item_month && item.mc_type_group === item_mc_type_group && item.cycle_time_actual
            );
            const n = filteredData.length;
            const harmonicSum = filteredData.reduce((sum, curr) => sum + 1 / curr.cycle_time_actual, 0);

            return n > 0 ? parseFloat((n / harmonicSum).toFixed(2)) : 0;
          }),
        })),
        {
          name: "Harmonic",
          type: "line",
          color: "black",
          data: month.map((item_month) => {
            const filteredData = totalStatus.filter((item) => item.month === item_month && item.cycle_time_actual);
            const n = filteredData.length;
            const harmonicSum = filteredData.reduce((sum, curr) => sum + 1 / curr.cycle_time_actual, 0);

            return n > 0 ? parseFloat((n / harmonicSum).toFixed(2)) : 0;
          }),
        },
        {
          name: "Target (Harmonic)",
          type: "line",
          color: "red",
          data: month.map((item_month) => {
            const filteredData = totalStatus.filter((item) => item.month === item_month && item.cycle_time_target);
            const n = filteredData.length;
            const harmonicSum = filteredData.reduce((sum, curr) => sum + 1 / curr.cycle_time_target, 0);

            return n > 0 ? parseFloat((n / harmonicSum).toFixed(2)) : 0;
          }),
        },
      ];

      // ==============================================

      chart_prod_machine.series = mc_no.map((item_mc) =>
        totalStatus.filter((item) => item.mc_no === item_mc).reduce((sum, curr) => sum + curr.prod_result, 0)
      );

      chart_opn_machine.series = mc_no.map((item_mc) => {
        filteredData = tableTotal_daily.filter((item) => item.mc_no === item_mc && item.monitoring_time * 0.1 < item.uptime_sec);

        const totalOpn = filteredData.reduce((sum, curr) => sum + curr.opn_rate, 0);
        const n = filteredData.length;

        return n > 0 ? parseFloat((totalOpn / n).toFixed(1)) : 0;
      });

      chart_cycletime_machine.series = mc_no.map((item_mc) => {
        const filteredData = totalStatus.filter((item) => item.mc_no === item_mc && item.cycle_time_actual);
        const n = filteredData.length;
        const harmonicSum = filteredData.reduce((sum, curr) => sum + 1 / curr.cycle_time_actual, 0);

        return n > 0 ? parseFloat((n / harmonicSum).toFixed(2)) : 0;
      });

      const alarm_machine = {};
      const alarm_machine_lose = {};

      totalStatus.forEach((item) => {
        const mc_no = item.mc_no;

        item.nameDurations.forEach((nd) => {
          const key = nd.name;
          if (!alarm_machine[key]) {
            alarm_machine[key] = {};
            alarm_machine_lose[key] = {};
          }

          if (!alarm_machine[key][mc_no]) {
            alarm_machine[key][mc_no] = 0;
            alarm_machine_lose[key][mc_no] = 0;
          }

          alarm_machine[key][mc_no] += nd.duration;
          alarm_machine_lose[key][mc_no] += nd.prod_lose;
        });
      });

      chart_alarm_time_machine.series = Object.entries(alarm_machine).map(([name, mcMap]) => {
        return {
          name,
          type: "bar",
          stack: "total",
          color: masterColor.find((i) => i.name.toUpperCase() === name.toUpperCase())?.color || "#464646",
          data: mc_no.map((mc_no) => mcMap[mc_no] || 0),
        };
      });

      chart_alarm_time_machine_lose.series = Object.entries(alarm_machine_lose).map(([name, mcMap]) => {
        return {
          name,
          type: "bar",
          stack: "total",
          color: masterColor.find((i) => i.name.toUpperCase() === name.toUpperCase())?.color || "#464646",
          data: mc_no.map((mc_no) => mcMap[mc_no] || 0),
        };
      });

      // ==============================================

      let tableTotal = totalStatus.map((item) => {
        return {
          date: item.date,
          shift: item.shift,
          mc_type: item.mc_type,
          mc_no: item.mc_no,
          part_no: item.part_no,
          prod_target: item.prod_target,
          prod_result: item.prod_result,
          prod_ng: item.prod_ng,
          yield: Number(((item.prod_result - item.prod_ng) / item.prod_result * 100).toFixed(2)),
          prod_diff: item.prod_result - item.prod_target,
          cycle_time_target: item.cycle_time_target,
          cycle_time_actual: item.cycle_time_actual,
          cycle_time_diff: parseFloat((item.cycle_time_target - item.cycle_time_actual).toFixed(2)),
          monitoring_time: item.monitoring_time,
          uptime_sec: item.uptime_sec,
          opn_rate: Number(((item.uptime_sec / item.monitoring_time) * 100).toFixed(1)),
          nameDurations: item.nameDurations,
        };
      });

      res.json({
        success: true,
        maxRegistered,
        chart_production,
        chart_operation_rate,
        chart_cycle_time,
        chart_alarm_time,
        chart_alarm_time_lose,

        chart_production_month,
        chart_production_month_avg,
        chart_operation_rate_month,
        chart_cycle_time_month,
        chart_alarm_time_month,
        chart_alarm_time_month_avg,
        chart_alarm_time_month_lose,
        chart_alarm_time_month_lose_avg,

        chart_production_group,
        chart_operation_rate_group,
        chart_cycle_time_group,

        chart_production_group_month,
        chart_production_group_month_avg,
        chart_operation_rate_group_month,
        chart_cycle_time_group_month,

        chart_prod_machine,
        chart_opn_machine,
        chart_cycletime_machine,
        chart_alarm_time_machine,
        chart_alarm_time_machine_lose,

        tableTotal,
        tableTotal_daily,
      });
    } else {
      console.error("Can't get data status from database");
      res.json({
        success: false,
        message: "Can't get data status from database",
      });
    }
  } catch (error) {
    console.error(error);
    res.json({
      success: false,
      message: "Can't get data usage from database",
      error: error.message,
    });
  }
});

module.exports = router;
