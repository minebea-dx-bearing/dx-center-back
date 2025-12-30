const express = require("express");
const moment = require("moment");
const router = express.Router();
const dbms = require("../instance/ms_instance_nmb");
const schedule = require("node-schedule");
const currentIP = require("../util/check_current_ip");
const get_data_mms = require("../util/get_data_mms");

const masterColor = [
  { name: "RUNNING", color: "#00b005" },
  { name: "STOP", color: "#FF0000" },
  { name: "WORN STONE", color: "#268149" },
  { name: "WAIT SETTER", color: "#B9E6D1" },
  { name: "WAIT OPT", color: "#C4CEB2" },
  { name: "WAIT PARTS  1 (URGENT)", color: "#FFC000" },
  { name: "MAINTENANCE", color: "#9800FF" },
  { name: "WAIT PARTS 2 (PC STOP)", color: "#000000" },
  { name: "SET UP", color: "#EE6CF5" },
  { name: "CHECK ROUNDNESS/ROUGHNESS", color: "#93CDDD" },
  { name: "Check Roundness/Roughness", color: "#93CDDD" },
  { name: "WAIT QA", color: "#FFFF00" },
  { name: "WAIT GQA", color: "#CB0505" },
  { name: "WAIT PART FEEDER", color: "#AFFF79" },
  { name: "WAIT Parts feeder", color: "#AFFF79" },
  { name: "Other", color: "#595959" },
  { name: "No signal", color: "#A6A6A6" },
  { name: "Signal Lamp error", color: "#D9D9D9" },
  { name: "ADJUST REMOVEMENT", color: "#04F7FB" },
  { name: "ADJ Dia", color: "#04F7FB" },
  { name: "ADJUST VISUAL", color: "#03548E" },
  { name: "ADJ visual", color: "#03548E" },
  { name: "ADJUST ROUNDNESS/ROUGHNESS", color: "#8C9FDC" },
  { name: "ADJ Roundness/Roughness", color: "#8C9FDC" },
  { name: "HYD ALARM", color: "#F94B01" },
  { name: "IR M/C Alarm", color: "#F94B01" },
  { name: "NO WORK", color: "#06BBA8" },
  { name: "RUNNING (No work)", color: "#06BBA8" },
  { name: "RUNNING(FULL WORK)", color: "#0494FB" },
  { name: "MISS LOAD", color: "#F5DC9B" },
  { name: "DRESS STONE", color: "#F5DC9B" },
  { name: "FULL WORK (STOP)", color: "#0494FB" },
  { name: "SPIN OUT Alarm", color: "#31859C" },
  // { name: "BREAK TIME", color: "#0000FF" },
];

const url_mms = "http://10.122.11.25:8080";
const db_direction_ir = "[mms].[dbo].[nmb_ir]";
const db_direction_sf = "[mms].[dbo].[nmb_sf]";

// let job = schedule.scheduleJob("7,17,27,37,47,57 * * * *", async () => {
//   if (currentIP.includes("10.120.10.140")) {
//     await get_data_mms(url_mms, dbms, db_direction);
//     console.log(`Running task update data MMS : ${moment().format("YYYY-MM-DD HH:mm:ss")}`);
//   }
// });

// router.get("/get_data_mms", async (req, res) => {
//   try {
//     const getDataMms = await get_data_mms(url_mms, dbms, db_direction);
//     res.json({
//       success: true,
//       message: "Update database finish",
//       getDataMms,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Can't get data MMS",
//       error: error.message,
//     });
//   }
// });

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
          FROM ${db_direction_ir}
          WHERE [date] BETWEEN '${startDateQuery}' AND '${endDateQuery}' AND [mc_type] LIKE 'F/L%'
          UNION ALL
          SELECT DISTINCT
              [shift]
              ,[mc_type]
              ,[mc_type] AS [mc_type_group]
              ,[mc_no]
          FROM ${db_direction_sf}
          WHERE [date] BETWEEN '${startDateQuery}' AND '${endDateQuery}' AND [mc_type] LIKE 'FL%'
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
        SELECT [mc_type] AS [mc_type_group]
            ,ROUND([cycle_time_target] / [ring_type], 2) AS [cycle_time_target]
            ,ROUND([cycle_time_actual] / [ring_type], 2) AS [cycle_time_actual] ,*
        FROM ${db_direction_ir}
        WHERE [date] BETWEEN '${startDateQuery}' AND '${endDateQuery}' AND [mc_type] LIKE 'F/L%'
        UNION ALL
        SELECT [mc_type] AS [mc_type_group]
            ,ROUND([cycle_time_target] / [ring_type], 2) AS [cycle_time_target]
            ,ROUND([cycle_time_actual] / [ring_type], 2) AS [cycle_time_actual] ,*
        FROM ${db_direction_sf}
        WHERE [date] BETWEEN '${startDateQuery}' AND '${endDateQuery}' AND [mc_type] LIKE 'FL%'
        ORDER BY [date],[mc_type],[mc_no],[shift]
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
              prod_lose: parseInt(item[durationKey] / item.cycle_time_target),
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

      const maxRegistered = moment(
        totalStatus.reduce((max, curr) => {
          return curr.registered > max ? curr.registered : max;
        }, totalStatus[0].registered)
      )
        .utc()
        .format("YYYY-MM-DD HH:mm:ss");

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

          // const totalUptime = filteredData.reduce((sum, curr) => sum + curr.uptime_sec, 0);
          // const totalMonitoring = filteredData.reduce((sum, curr) => sum + curr.monitoring_time, 0);

          // const utili = totalMonitoring > 0 ? parseFloat(((totalUptime / totalMonitoring) * 100).toFixed(1)) : 0;

          // if (utili > 10) {
          return item_date;
          // } else {
          // return null;
          // }
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
          yield: Number((((item.prod_result - item.prod_ng) / item.prod_result) * 100).toFixed(2)),
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
      let chart_ng = {
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
      let chart_ng_group = {
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
      let chart_ng_month = {
        categories: month,
        series: [],
      };
      let chart_production_month_avg = {
        categories: month,
        series: [],
      };
      let chart_ng_month_avg = {
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
      let chart_ng_group_month = {
        categories: month,
        series: [],
      };
      let chart_ng_group_month_avg = {
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
      let chart_ng_machine = {
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

      chart_ng.series = [
        ...mc_type.map((item_mc_type) => ({
          name: item_mc_type,
          type: "bar",
          stack: "total",
          data: workingDay.map((item_date) =>
            totalStatus.filter((item) => item.date === item_date && item.mc_type === item_mc_type).reduce((sum, curr) => sum + curr.prod_ng, 0)
          ),
        })),
        {
          name: "Total",
          type: "scatter",
          symbolSize: 0,
          color: "black",
          data: workingDay.map((item_date) => totalStatus.filter((item) => item.date === item_date).reduce((sum, curr) => sum + curr.prod_ng, 0)),
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

      chart_ng_month.series = [
        ...mc_type.map((item_mc_type) => ({
          name: item_mc_type,
          type: "bar",
          stack: "total",
          data: month.map((item_month) =>
            totalStatus.filter((item) => item.month === item_month && item.mc_type === item_mc_type).reduce((sum, curr) => sum + curr.prod_ng, 0)
          ),
        })),
        {
          name: "Total",
          type: "scatter",
          symbolSize: 0,
          color: "black",
          data: month.map((item_month) => totalStatus.filter((item) => item.month === item_month).reduce((sum, curr) => sum + curr.prod_ng, 0)),
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

      chart_ng_month_avg.series = [
        ...mc_type.map((item_mc_type) => ({
          name: item_mc_type,
          type: "bar",
          stack: "total",
          data: month.map((item_month) => {
            const filtered = totalStatus.filter((item) => item.month === item_month && item.mc_type === item_mc_type);
            const countDate = [...new Set(filtered.map((item) => item.date))].length;
            const total = filtered.reduce((sum, curr) => sum + curr.prod_ng, 0);
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
            const total = filtered.reduce((sum, curr) => sum + curr.prod_ng, 0);
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
            const filteredData = tableTotal_daily.filter(
              (item) => item.month === item_month && item.monitoring_time * percentQuery < item.uptime_sec
            );

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

      chart_ng_group.series = [
        ...mc_type_group.map((item_mc_type_group) => ({
          name: item_mc_type_group,
          type: "bar",
          stack: "total",
          data: workingDay.map((item_date) =>
            totalStatus
              .filter((item) => item.date === item_date && item.mc_type_group === item_mc_type_group)
              .reduce((sum, curr) => sum + curr.prod_ng, 0)
          ),
        })),
        {
          name: "Total",
          type: "scatter",
          symbolSize: 0,
          color: "black",
          data: workingDay.map((item_date) => totalStatus.filter((item) => item.date === item_date).reduce((sum, curr) => sum + curr.prod_ng, 0)),
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

      chart_ng_group_month.series = [
        ...mc_type_group.map((item_mc_type_group) => ({
          name: item_mc_type_group,
          type: "bar",
          stack: "total",
          data: month.map((item_month) =>
            totalStatus
              .filter((item) => item.month === item_month && item.mc_type_group === item_mc_type_group)
              .reduce((sum, curr) => sum + curr.prod_ng, 0)
          ),
        })),
        {
          name: "Total",
          type: "scatter",
          symbolSize: 0,
          color: "black",
          data: month.map((item_month) => totalStatus.filter((item) => item.month === item_month).reduce((sum, curr) => sum + curr.prod_ng, 0)),
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

      chart_ng_group_month_avg.series = [
        ...mc_type_group.map((item_mc_type_group) => ({
          name: item_mc_type_group,
          type: "bar",
          stack: "total",
          data: month.map((item_month) => {
            const filtered = totalStatus.filter((item) => item.month === item_month && item.mc_type_group === item_mc_type_group);
            const countDate = [...new Set(filtered.map((item) => item.date))].length;
            const total = filtered.reduce((sum, curr) => sum + curr.prod_ng, 0);
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
            const total = filtered.reduce((sum, curr) => sum + curr.prod_ng, 0);
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
              (item) =>
                item.month === item_month && item.mc_type_group === item_mc_type_group && item.monitoring_time * percentQuery < item.uptime_sec
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
            const filteredData = tableTotal_daily.filter(
              (item) => item.month === item_month && item.monitoring_time * percentQuery < item.uptime_sec
            );

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

      chart_ng_machine.series = mc_no.map((item_mc) =>
        totalStatus.filter((item) => item.mc_no === item_mc).reduce((sum, curr) => sum + curr.prod_ng, 0)
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
          yield: Number((((item.prod_result - item.prod_ng) / item.prod_result) * 100).toFixed(2)),
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
        chart_ng,
        chart_operation_rate,
        chart_cycle_time,
        chart_alarm_time,
        chart_alarm_time_lose,

        chart_production_month,
        chart_ng_month,
        chart_production_month_avg,
        chart_ng_month_avg,
        chart_operation_rate_month,
        chart_cycle_time_month,
        chart_alarm_time_month,
        chart_alarm_time_month_avg,
        chart_alarm_time_month_lose,
        chart_alarm_time_month_lose_avg,

        chart_production_group,
        chart_ng_group,
        chart_operation_rate_group,
        chart_cycle_time_group,

        chart_production_group_month,
        chart_ng_group_month,
        chart_production_group_month_avg,
        chart_ng_group_month_avg,
        chart_operation_rate_group_month,
        chart_cycle_time_group_month,

        chart_prod_machine,
        chart_ng_machine,
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
