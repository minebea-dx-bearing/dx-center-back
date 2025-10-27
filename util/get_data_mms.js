const moment = require("moment");
const axios = require("axios");

const get_data_mms = async (url, dbms, database) => {
  try {
    let nowDate = moment();
    let date;
    if (nowDate.format("HH") < 7) {
      date = nowDate.subtract(1, "days").format("YYYY-MM-DD");
    } else {
      date = nowDate.format("YYYY-MM-DD");
    }

    let machineData = await axios.get(`${url}/v2/grouped_signals/by_line`);
    machineData = machineData.data.flatMap((item) => {
      return item.signals.map((signal) => {
        return {
          mc_type: item.name.toUpperCase(),
          mc_no: signal.name.toUpperCase(),
          number: signal.number,
        };
      });
    });

    let allNumber = machineData.map((item) => item.number).join(",");


    let taktTimeSignal = await (await axios.get(`${url}/v1/list/signals/monitors/takt_time?signal_numbers=${allNumber}&count=100`)).data.data;
    machineData = machineData.map((item) => {
      let findData = taktTimeSignal.find((i) => i.signalNumber === item.number);
      if (findData) {
        let data_cycle_time = [];
        findData.taktTimes.forEach((taktTime) => {
          taktTime.values.forEach((taktValue) => {
            data_cycle_time.push(parseFloat((taktValue.work / (1000 * 1000 * 1000)).toFixed(2)));
          });
        });
        data_cycle_time.sort((a, b) => a - b);
        let median;
        const middle = Math.floor(data_cycle_time.length / 2);

        if (data_cycle_time.length % 2 === 0) {
          median = (data_cycle_time[middle - 1] + data_cycle_time[middle]) / 2;
        } else {
          median = data_cycle_time[middle];
        }
        return {
          ...item,
          cycle_time_target: parseFloat((findData.targetTaktTime / (1000 * 1000 * 1000)).toFixed(2)),
          cycle_time_actual: parseFloat(median.toFixed(2)),
        };
      }
    });

    let wholeSignal = (await axios.get(`${url}/v4/list/signals/monitors/whole/daily?signal_numbers=${allNumber}`)).data.data;
    machineData = machineData.map((item) => {
      let findData = wholeSignal.find((i) => i.name === item.mc_no);
      if (findData) {
        let shiftName = "UNKNOWN";
        let time = nowDate.format("HH:mm");
        findData.shifts.forEach((shift) => {
          let start = shift.startClock;
          let end = shift.endClock;

          if ((start < end && time >= start && time < end) || (start > end && (time >= start || time < end))) {
            shiftName = shift.name;
          }
        });

        let totalStatus = findData.statusCumulativeValues.map((status) => {
          let findStatus = findData.statusSettings.find((i) => i.number === status.number);
          if (findStatus) {
            return {
              ...status,
              name: findStatus.name,
            };
          }
        });

        let ring_type = 1;
        if (findData.currentModel) {
          let match = findData.currentModel.name.match(/\((\d+)\)/);
          if (match) {
            ring_type = parseInt(match[1]);
          }
        }

        return {
          ...item,
          registered: moment().format("YYYY-MM-DD HH:mm:ss"),
          date: date,
          shift: shiftName.toUpperCase(),
          part_no: findData.currentModel ? findData.currentModel.name : null,
          ring_type: ring_type,
          prod_target: Number((findData.productionTarget1 / findData.shifts.length).toFixed(0)),
          prod_result: findData.productionQuantity1,
          prod_ng: findData.ngCount,
          monitoring_time: findData.monitoringTime,
          uptime_sec: findData.uptimeSec,
          cycle_time_actual: findData.uptimeSec === 0 ? null : item.cycle_time_actual,
          totalStatus,
        };
      }
    });

    machineData = machineData.filter(Boolean);

    // ถ้ามีข้อมูลในกะที่กำลัง stamp ลง SQL ใน SQL แล้วให้ลบทิ้ง (ป้องการยิง test แล้วเขียนเข้ามาไว้ก่อน)
    for (let i = 0; i < machineData.length; i++) {
      await dbms.query(
        `
          DELETE ${database}
          WHERE [date] = '${machineData[i].date}' AND [shift] = '${machineData[i].shift}' AND [mc_no] = '${machineData[i].mc_no}'
        `
      );
    }

    let todayData = await dbms.query(
      `
        SELECT
          [date]
          ,[mc_no]
          ,SUM([prod_result]) AS [sum_prod_result]
          ,SUM([prod_ng]) AS [sum_prod_ng]
          ,SUM([monitoring_time]) AS [sum_monitoring_time]
          ,SUM([uptime_sec]) AS [sum_uptime_sec]

          ,SUM([monitoring_time]) AS [sum_monitoring_time]
          ,SUM([uptime_sec]) AS [sum_uptime_sec]

          ,MAX([name_0]) AS [name_0]
          ,SUM([duration_0]) AS [sum_duration_0]
          ,SUM([count_0]) AS [sum_count_0]

          ,MAX([name_1]) AS [name_1]
          ,SUM([duration_1]) AS [sum_duration_1]
          ,SUM([count_1]) AS [sum_count_1]

          ,MAX([name_2]) AS [name_2]
          ,SUM([duration_2]) AS [sum_duration_2]
          ,SUM([count_2]) AS [sum_count_2]

          ,MAX([name_3]) AS [name_3]
          ,SUM([duration_3]) AS [sum_duration_3]
          ,SUM([count_3]) AS [sum_count_3]

          ,MAX([name_4]) AS [name_4]
          ,SUM([duration_4]) AS [sum_duration_4]
          ,SUM([count_4]) AS [sum_count_4]

          ,MAX([name_5]) AS [name_5]
          ,SUM([duration_5]) AS [sum_duration_5]
          ,SUM([count_5]) AS [sum_count_5]

          ,MAX([name_6]) AS [name_6]
          ,SUM([duration_6]) AS [sum_duration_6]
          ,SUM([count_6]) AS [sum_count_6]

          ,MAX([name_7]) AS [name_7]
          ,SUM([duration_7]) AS [sum_duration_7]
          ,SUM([count_7]) AS [sum_count_7]

          ,MAX([name_8]) AS [name_8]
          ,SUM([duration_8]) AS [sum_duration_8]
          ,SUM([count_8]) AS [sum_count_8]

          ,MAX([name_9]) AS [name_9]
          ,SUM([duration_9]) AS [sum_duration_9]
          ,SUM([count_9]) AS [sum_count_9]

          ,MAX([name_10]) AS [name_10]
          ,SUM([duration_10]) AS [sum_duration_10]
          ,SUM([count_10]) AS [sum_count_10]

          ,MAX([name_11]) AS [name_11]
          ,SUM([duration_11]) AS [sum_duration_11]
          ,SUM([count_11]) AS [sum_count_11]

          ,MAX([name_12]) AS [name_12]
          ,SUM([duration_12]) AS [sum_duration_12]
          ,SUM([count_12]) AS [sum_count_12]

          ,MAX([name_13]) AS [name_13]
          ,SUM([duration_13]) AS [sum_duration_13]
          ,SUM([count_13]) AS [sum_count_13]

          ,MAX([name_14]) AS [name_14]
          ,SUM([duration_14]) AS [sum_duration_14]
          ,SUM([count_14]) AS [sum_count_14]

          ,MAX([name_15]) AS [name_15]
          ,SUM([duration_15]) AS [sum_duration_15]
          ,SUM([count_15]) AS [sum_count_15]

          ,MAX([name_16]) AS [name_16]
          ,SUM([duration_16]) AS [sum_duration_16]
          ,SUM([count_16]) AS [sum_count_16]

          ,MAX([name_17]) AS [name_17]
          ,SUM([duration_17]) AS [sum_duration_17]
          ,SUM([count_17]) AS [sum_count_17]

          ,MAX([name_18]) AS [name_18]
          ,SUM([duration_18]) AS [sum_duration_18]
          ,SUM([count_18]) AS [sum_count_18]

          ,MAX([name_19]) AS [name_19]
          ,SUM([duration_19]) AS [sum_duration_19]
          ,SUM([count_19]) AS [sum_count_19]

          ,MAX([name_20]) AS [name_20]
          ,SUM([duration_20]) AS [sum_duration_20]
          ,SUM([count_20]) AS [sum_count_20]

          ,MAX([name_21]) AS [name_21]
          ,SUM([duration_21]) AS [sum_duration_21]
          ,SUM([count_21]) AS [sum_count_21]

          ,MAX([name_22]) AS [name_22]
          ,SUM([duration_22]) AS [sum_duration_22]
          ,SUM([count_22]) AS [sum_count_22]

          ,MAX([name_23]) AS [name_23]
          ,SUM([duration_23]) AS [sum_duration_23]
          ,SUM([count_23]) AS [sum_count_23]

          ,MAX([name_24]) AS [name_24]
          ,SUM([duration_24]) AS [sum_duration_24]
          ,SUM([count_24]) AS [sum_count_24]

          ,MAX([name_25]) AS [name_25]
          ,SUM([duration_25]) AS [sum_duration_25]
          ,SUM([count_25]) AS [sum_count_25]

          ,MAX([name_26]) AS [name_26]
          ,SUM([duration_26]) AS [sum_duration_26]
          ,SUM([count_26]) AS [sum_count_26]

          ,MAX([name_27]) AS [name_27]
          ,SUM([duration_27]) AS [sum_duration_27]
          ,SUM([count_27]) AS [sum_count_27]

          ,MAX([name_28]) AS [name_28]
          ,SUM([duration_28]) AS [sum_duration_28]
          ,SUM([count_28]) AS [sum_count_28]

          ,MAX([name_29]) AS [name_29]
          ,SUM([duration_29]) AS [sum_duration_29]
          ,SUM([count_29]) AS [sum_count_29]

          ,MAX([name_30]) AS [name_30]
          ,SUM([duration_30]) AS [sum_duration_30]
          ,SUM([count_30]) AS [sum_count_30]

          ,MAX([name_31]) AS [name_31]
          ,SUM([duration_31]) AS [sum_duration_31]
          ,SUM([count_31]) AS [sum_count_31]

          ,MAX([name_32]) AS [name_32]
          ,SUM([duration_32]) AS [sum_duration_32]
          ,SUM([count_32]) AS [sum_count_32]

          ,MAX([name_33]) AS [name_33]
          ,SUM([duration_33]) AS [sum_duration_33]
          ,SUM([count_33]) AS [sum_count_33]

          ,MAX([name_34]) AS [name_34]
          ,SUM([duration_34]) AS [sum_duration_34]
          ,SUM([count_34]) AS [sum_count_34]

          ,MAX([name_35]) AS [name_35]
          ,SUM([duration_35]) AS [sum_duration_35]
          ,SUM([count_35]) AS [sum_count_35]

          ,MAX([name_36]) AS [name_36]
          ,SUM([duration_36]) AS [sum_duration_36]
          ,SUM([count_36]) AS [sum_count_36]

          ,MAX([name_37]) AS [name_37]
          ,SUM([duration_37]) AS [sum_duration_37]
          ,SUM([count_37]) AS [sum_count_37]

          ,MAX([name_38]) AS [name_38]
          ,SUM([duration_38]) AS [sum_duration_38]
          ,SUM([count_38]) AS [sum_count_38]

          ,MAX([name_39]) AS [name_39]
          ,SUM([duration_39]) AS [sum_duration_39]
          ,SUM([count_39]) AS [sum_count_39]

          ,MAX([name_40]) AS [name_40]
          ,SUM([duration_40]) AS [sum_duration_40]
          ,SUM([count_40]) AS [sum_count_40]

          ,MAX([name_41]) AS [name_41]
          ,SUM([duration_41]) AS [sum_duration_41]
          ,SUM([count_41]) AS [sum_count_41]

          ,MAX([name_42]) AS [name_42]
          ,SUM([duration_42]) AS [sum_duration_42]
          ,SUM([count_42]) AS [sum_count_42]

          ,MAX([name_43]) AS [name_43]
          ,SUM([duration_43]) AS [sum_duration_43]
          ,SUM([count_43]) AS [sum_count_43]

          ,MAX([name_44]) AS [name_44]
          ,SUM([duration_44]) AS [sum_duration_44]
          ,SUM([count_44]) AS [sum_count_44]
        FROM ${database}
        WHERE [date] = '${date}'
        GROUP BY
          [date]
          ,[mc_no]
      `
    );

    // หักลบเมื่อวันนั้นมีข้อมูลกะก่อนหน้า record เอาไว้แล้ว
    if (todayData[1] > 0) {
      machineData = machineData.map((item) => {
        let findData = todayData[0].find((i) => i.mc_no === item.mc_no);
        if (findData) {
          item.prod_result -= findData.sum_prod_result;
          item.prod_ng -= findData.sum_prod_ng;
          item.monitoring_time -= findData.sum_monitoring_time;
          item.uptime_sec -= findData.sum_uptime_sec;
          item.totalStatus.map((itemStatus) => {
            itemStatus.duration -= findData[`sum_duration_${itemStatus.number}`];
            itemStatus.count -= findData[`sum_count_${itemStatus.number}`];
          });
        }
        return {
          ...item,
        };
      });
    }

    for (let i = 0; i < machineData.length; i++) {
      await dbms.query(
        `
          INSERT INTO ${database}
          (
            [registered]
            ,[date]
            ,[shift]
            ,[mc_type]
            ,[mc_no]
            ,[part_no]
            ,[ring_type]
            ,[cycle_time_target]
            ,[cycle_time_actual]
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
          )
          VALUES
          (
            ${machineData[i].registered ? `'${machineData[i].registered}'` : "NULL"}
            ,${machineData[i].date ? `'${machineData[i].date}'` : "NULL"}
            ,${machineData[i].shift ? `'${machineData[i].shift}'` : "NULL"}
            ,${machineData[i].mc_type ? `'${machineData[i].mc_type}'` : "NULL"}
            ,${machineData[i].mc_no ? `'${machineData[i].mc_no}'` : "NULL"}
            ,${machineData[i].part_no ? `'${machineData[i].part_no}'` : "NULL"}
            ,${machineData[i].ring_type}
            ,${machineData[i].cycle_time_target ? machineData[i].cycle_time_target : "NULL"}
            ,${machineData[i].cycle_time_actual ? machineData[i].cycle_time_actual : "NULL"}
            ,${machineData[i].prod_target}
            ,${machineData[i].prod_result}
            ,${machineData[i].prod_ng}

            ,${machineData[i].monitoring_time}
            ,${machineData[i].uptime_sec}

            ,${machineData[i].totalStatus[0] ? `'${machineData[i].totalStatus[0].name}'` : "NULL"}
            ,${machineData[i].totalStatus[0] ? `${machineData[i].totalStatus[0].duration}` : "NULL"}
            ,${machineData[i].totalStatus[0] ? `${machineData[i].totalStatus[0].count}` : "NULL"}

            ,${machineData[i].totalStatus[1] ? `'${machineData[i].totalStatus[1].name}'` : "NULL"}
            ,${machineData[i].totalStatus[1] ? `${machineData[i].totalStatus[1].duration}` : "NULL"}
            ,${machineData[i].totalStatus[1] ? `${machineData[i].totalStatus[1].count}` : "NULL"}

            ,${machineData[i].totalStatus[2] ? `'${machineData[i].totalStatus[2].name}'` : "NULL"}
            ,${machineData[i].totalStatus[2] ? `${machineData[i].totalStatus[2].duration}` : "NULL"}
            ,${machineData[i].totalStatus[2] ? `${machineData[i].totalStatus[2].count}` : "NULL"}

            ,${machineData[i].totalStatus[3] ? `'${machineData[i].totalStatus[3].name}'` : "NULL"}
            ,${machineData[i].totalStatus[3] ? `${machineData[i].totalStatus[3].duration}` : "NULL"}
            ,${machineData[i].totalStatus[3] ? `${machineData[i].totalStatus[3].count}` : "NULL"}

            ,${machineData[i].totalStatus[4] ? `'${machineData[i].totalStatus[4].name}'` : "NULL"}
            ,${machineData[i].totalStatus[4] ? `${machineData[i].totalStatus[4].duration}` : "NULL"}
            ,${machineData[i].totalStatus[4] ? `${machineData[i].totalStatus[4].count}` : "NULL"}

            ,${machineData[i].totalStatus[5] ? `'${machineData[i].totalStatus[5].name}'` : "NULL"}
            ,${machineData[i].totalStatus[5] ? `${machineData[i].totalStatus[5].duration}` : "NULL"}
            ,${machineData[i].totalStatus[5] ? `${machineData[i].totalStatus[5].count}` : "NULL"}

            ,${machineData[i].totalStatus[6] ? `'${machineData[i].totalStatus[6].name}'` : "NULL"}
            ,${machineData[i].totalStatus[6] ? `${machineData[i].totalStatus[6].duration}` : "NULL"}
            ,${machineData[i].totalStatus[6] ? `${machineData[i].totalStatus[6].count}` : "NULL"}

            ,${machineData[i].totalStatus[7] ? `'${machineData[i].totalStatus[7].name}'` : "NULL"}
            ,${machineData[i].totalStatus[7] ? `${machineData[i].totalStatus[7].duration}` : "NULL"}
            ,${machineData[i].totalStatus[7] ? `${machineData[i].totalStatus[7].count}` : "NULL"}

            ,${machineData[i].totalStatus[8] ? `'${machineData[i].totalStatus[8].name}'` : "NULL"}
            ,${machineData[i].totalStatus[8] ? `${machineData[i].totalStatus[8].duration}` : "NULL"}
            ,${machineData[i].totalStatus[8] ? `${machineData[i].totalStatus[8].count}` : "NULL"}

            ,${machineData[i].totalStatus[9] ? `'${machineData[i].totalStatus[9].name}'` : "NULL"}
            ,${machineData[i].totalStatus[9] ? `${machineData[i].totalStatus[9].duration}` : "NULL"}
            ,${machineData[i].totalStatus[9] ? `${machineData[i].totalStatus[9].count}` : "NULL"}

            ,${machineData[i].totalStatus[10] ? `'${machineData[i].totalStatus[10].name}'` : "NULL"}
            ,${machineData[i].totalStatus[10] ? `${machineData[i].totalStatus[10].duration}` : "NULL"}
            ,${machineData[i].totalStatus[10] ? `${machineData[i].totalStatus[10].count}` : "NULL"}

            ,${machineData[i].totalStatus[11] ? `'${machineData[i].totalStatus[11].name}'` : "NULL"}
            ,${machineData[i].totalStatus[11] ? `${machineData[i].totalStatus[11].duration}` : "NULL"}
            ,${machineData[i].totalStatus[11] ? `${machineData[i].totalStatus[11].count}` : "NULL"}

            ,${machineData[i].totalStatus[12] ? `'${machineData[i].totalStatus[12].name}'` : "NULL"}
            ,${machineData[i].totalStatus[12] ? `${machineData[i].totalStatus[12].duration}` : "NULL"}
            ,${machineData[i].totalStatus[12] ? `${machineData[i].totalStatus[12].count}` : "NULL"}

            ,${machineData[i].totalStatus[13] ? `'${machineData[i].totalStatus[13].name}'` : "NULL"}
            ,${machineData[i].totalStatus[13] ? `${machineData[i].totalStatus[13].duration}` : "NULL"}
            ,${machineData[i].totalStatus[13] ? `${machineData[i].totalStatus[13].count}` : "NULL"}

            ,${machineData[i].totalStatus[14] ? `'${machineData[i].totalStatus[14].name}'` : "NULL"}
            ,${machineData[i].totalStatus[14] ? `${machineData[i].totalStatus[14].duration}` : "NULL"}
            ,${machineData[i].totalStatus[14] ? `${machineData[i].totalStatus[14].count}` : "NULL"}

            ,${machineData[i].totalStatus[15] ? `'${machineData[i].totalStatus[15].name}'` : "NULL"}
            ,${machineData[i].totalStatus[15] ? `${machineData[i].totalStatus[15].duration}` : "NULL"}
            ,${machineData[i].totalStatus[15] ? `${machineData[i].totalStatus[15].count}` : "NULL"}

            ,${machineData[i].totalStatus[16] ? `'${machineData[i].totalStatus[16].name}'` : "NULL"}
            ,${machineData[i].totalStatus[16] ? `${machineData[i].totalStatus[16].duration}` : "NULL"}
            ,${machineData[i].totalStatus[16] ? `${machineData[i].totalStatus[16].count}` : "NULL"}

            ,${machineData[i].totalStatus[17] ? `'${machineData[i].totalStatus[17].name}'` : "NULL"}
            ,${machineData[i].totalStatus[17] ? `${machineData[i].totalStatus[17].duration}` : "NULL"}
            ,${machineData[i].totalStatus[17] ? `${machineData[i].totalStatus[17].count}` : "NULL"}

            ,${machineData[i].totalStatus[18] ? `'${machineData[i].totalStatus[18].name}'` : "NULL"}
            ,${machineData[i].totalStatus[18] ? `${machineData[i].totalStatus[18].duration}` : "NULL"}
            ,${machineData[i].totalStatus[18] ? `${machineData[i].totalStatus[18].count}` : "NULL"}

            ,${machineData[i].totalStatus[19] ? `'${machineData[i].totalStatus[19].name}'` : "NULL"}
            ,${machineData[i].totalStatus[19] ? `${machineData[i].totalStatus[19].duration}` : "NULL"}
            ,${machineData[i].totalStatus[19] ? `${machineData[i].totalStatus[19].count}` : "NULL"}

            ,${machineData[i].totalStatus[20] ? `'${machineData[i].totalStatus[20].name}'` : "NULL"}
            ,${machineData[i].totalStatus[20] ? `${machineData[i].totalStatus[20].duration}` : "NULL"}
            ,${machineData[i].totalStatus[20] ? `${machineData[i].totalStatus[20].count}` : "NULL"}

            ,${machineData[i].totalStatus[21] ? `'${machineData[i].totalStatus[21].name}'` : "NULL"}
            ,${machineData[i].totalStatus[21] ? `${machineData[i].totalStatus[21].duration}` : "NULL"}
            ,${machineData[i].totalStatus[21] ? `${machineData[i].totalStatus[21].count}` : "NULL"}

            ,${machineData[i].totalStatus[22] ? `'${machineData[i].totalStatus[22].name}'` : "NULL"}
            ,${machineData[i].totalStatus[22] ? `${machineData[i].totalStatus[22].duration}` : "NULL"}
            ,${machineData[i].totalStatus[22] ? `${machineData[i].totalStatus[22].count}` : "NULL"}

            ,${machineData[i].totalStatus[23] ? `'${machineData[i].totalStatus[23].name}'` : "NULL"}
            ,${machineData[i].totalStatus[23] ? `${machineData[i].totalStatus[23].duration}` : "NULL"}
            ,${machineData[i].totalStatus[23] ? `${machineData[i].totalStatus[23].count}` : "NULL"}

            ,${machineData[i].totalStatus[24] ? `'${machineData[i].totalStatus[24].name}'` : "NULL"}
            ,${machineData[i].totalStatus[24] ? `${machineData[i].totalStatus[24].duration}` : "NULL"}
            ,${machineData[i].totalStatus[24] ? `${machineData[i].totalStatus[24].count}` : "NULL"}

            ,${machineData[i].totalStatus[25] ? `'${machineData[i].totalStatus[25].name}'` : "NULL"}
            ,${machineData[i].totalStatus[25] ? `${machineData[i].totalStatus[25].duration}` : "NULL"}
            ,${machineData[i].totalStatus[25] ? `${machineData[i].totalStatus[25].count}` : "NULL"}

            ,${machineData[i].totalStatus[26] ? `'${machineData[i].totalStatus[26].name}'` : "NULL"}
            ,${machineData[i].totalStatus[26] ? `${machineData[i].totalStatus[26].duration}` : "NULL"}
            ,${machineData[i].totalStatus[26] ? `${machineData[i].totalStatus[26].count}` : "NULL"}

            ,${machineData[i].totalStatus[27] ? `'${machineData[i].totalStatus[27].name}'` : "NULL"}
            ,${machineData[i].totalStatus[27] ? `${machineData[i].totalStatus[27].duration}` : "NULL"}
            ,${machineData[i].totalStatus[27] ? `${machineData[i].totalStatus[27].count}` : "NULL"}

            ,${machineData[i].totalStatus[28] ? `'${machineData[i].totalStatus[28].name}'` : "NULL"}
            ,${machineData[i].totalStatus[28] ? `${machineData[i].totalStatus[28].duration}` : "NULL"}
            ,${machineData[i].totalStatus[28] ? `${machineData[i].totalStatus[28].count}` : "NULL"}

            ,${machineData[i].totalStatus[29] ? `'${machineData[i].totalStatus[29].name}'` : "NULL"}
            ,${machineData[i].totalStatus[29] ? `${machineData[i].totalStatus[29].duration}` : "NULL"}
            ,${machineData[i].totalStatus[29] ? `${machineData[i].totalStatus[29].count}` : "NULL"}

            ,${machineData[i].totalStatus[30] ? `'${machineData[i].totalStatus[30].name}'` : "NULL"}
            ,${machineData[i].totalStatus[30] ? `${machineData[i].totalStatus[30].duration}` : "NULL"}
            ,${machineData[i].totalStatus[30] ? `${machineData[i].totalStatus[30].count}` : "NULL"}

            ,${machineData[i].totalStatus[31] ? `'${machineData[i].totalStatus[31].name}'` : "NULL"}
            ,${machineData[i].totalStatus[31] ? `${machineData[i].totalStatus[31].duration}` : "NULL"}
            ,${machineData[i].totalStatus[31] ? `${machineData[i].totalStatus[31].count}` : "NULL"}

            ,${machineData[i].totalStatus[32] ? `'${machineData[i].totalStatus[32].name}'` : "NULL"}
            ,${machineData[i].totalStatus[32] ? `${machineData[i].totalStatus[32].duration}` : "NULL"}
            ,${machineData[i].totalStatus[32] ? `${machineData[i].totalStatus[32].count}` : "NULL"}

            ,${machineData[i].totalStatus[33] ? `'${machineData[i].totalStatus[33].name}'` : "NULL"}
            ,${machineData[i].totalStatus[33] ? `${machineData[i].totalStatus[33].duration}` : "NULL"}
            ,${machineData[i].totalStatus[33] ? `${machineData[i].totalStatus[33].count}` : "NULL"}

            ,${machineData[i].totalStatus[34] ? `'${machineData[i].totalStatus[34].name}'` : "NULL"}
            ,${machineData[i].totalStatus[34] ? `${machineData[i].totalStatus[34].duration}` : "NULL"}
            ,${machineData[i].totalStatus[34] ? `${machineData[i].totalStatus[34].count}` : "NULL"}

            ,${machineData[i].totalStatus[35] ? `'${machineData[i].totalStatus[35].name}'` : "NULL"}
            ,${machineData[i].totalStatus[35] ? `${machineData[i].totalStatus[35].duration}` : "NULL"}
            ,${machineData[i].totalStatus[35] ? `${machineData[i].totalStatus[35].count}` : "NULL"}

            ,${machineData[i].totalStatus[36] ? `'${machineData[i].totalStatus[36].name}'` : "NULL"}
            ,${machineData[i].totalStatus[36] ? `${machineData[i].totalStatus[36].duration}` : "NULL"}
            ,${machineData[i].totalStatus[36] ? `${machineData[i].totalStatus[36].count}` : "NULL"}

            ,${machineData[i].totalStatus[37] ? `'${machineData[i].totalStatus[37].name}'` : "NULL"}
            ,${machineData[i].totalStatus[37] ? `${machineData[i].totalStatus[37].duration}` : "NULL"}
            ,${machineData[i].totalStatus[37] ? `${machineData[i].totalStatus[37].count}` : "NULL"}

            ,${machineData[i].totalStatus[38] ? `'${machineData[i].totalStatus[38].name}'` : "NULL"}
            ,${machineData[i].totalStatus[38] ? `${machineData[i].totalStatus[38].duration}` : "NULL"}
            ,${machineData[i].totalStatus[38] ? `${machineData[i].totalStatus[38].count}` : "NULL"}

            ,${machineData[i].totalStatus[39] ? `'${machineData[i].totalStatus[39].name}'` : "NULL"}
            ,${machineData[i].totalStatus[39] ? `${machineData[i].totalStatus[39].duration}` : "NULL"}
            ,${machineData[i].totalStatus[39] ? `${machineData[i].totalStatus[39].count}` : "NULL"}

            ,${machineData[i].totalStatus[40] ? `'${machineData[i].totalStatus[40].name}'` : "NULL"}
            ,${machineData[i].totalStatus[40] ? `${machineData[i].totalStatus[40].duration}` : "NULL"}
            ,${machineData[i].totalStatus[40] ? `${machineData[i].totalStatus[40].count}` : "NULL"}

            ,${machineData[i].totalStatus[41] ? `'${machineData[i].totalStatus[41].name}'` : "NULL"}
            ,${machineData[i].totalStatus[41] ? `${machineData[i].totalStatus[41].duration}` : "NULL"}
            ,${machineData[i].totalStatus[41] ? `${machineData[i].totalStatus[41].count}` : "NULL"}

            ,${machineData[i].totalStatus[42] ? `'${machineData[i].totalStatus[42].name}'` : "NULL"}
            ,${machineData[i].totalStatus[42] ? `${machineData[i].totalStatus[42].duration}` : "NULL"}
            ,${machineData[i].totalStatus[42] ? `${machineData[i].totalStatus[42].count}` : "NULL"}

            ,${machineData[i].totalStatus[43] ? `'${machineData[i].totalStatus[43].name}'` : "NULL"}
            ,${machineData[i].totalStatus[43] ? `${machineData[i].totalStatus[43].duration}` : "NULL"}
            ,${machineData[i].totalStatus[43] ? `${machineData[i].totalStatus[43].count}` : "NULL"}

            ,${machineData[i].totalStatus[44] ? `'${machineData[i].totalStatus[44].name}'` : "NULL"}
            ,${machineData[i].totalStatus[44] ? `${machineData[i].totalStatus[44].duration}` : "NULL"}
            ,${machineData[i].totalStatus[44] ? `${machineData[i].totalStatus[44].count}` : "NULL"}
          )
      `
      );
    }

    return machineData;
  } catch (error) {
    console.log(error);
    return error.message;
  }
};

module.exports = get_data_mms;