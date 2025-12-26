const { Sequelize } = require("sequelize");
const database = require("../instance/ms_instance_center");
const JobRequest_table = database.define("JobRequest", {
  DocReq: {
    type: Sequelize.STRING,
  },
  ReqDate: {
    type: Sequelize.DATEONLY,
  },
  ReqTime: {
    type: Sequelize.TIME,
  },
  UserReq: {
    type: Sequelize.STRING,
  },
  Gmail: {
    type: Sequelize.STRING,
  },
  Factory: {
    type: Sequelize.STRING,
  },
  Process: {
    type: Sequelize.STRING,
  },
  Category: {
    type: Sequelize.STRING,
  },
  ReqTitle: {
    type: Sequelize.STRING,
  },
  Before: {
    type: Sequelize.INTEGER,
  },
  After: {
    type: Sequelize.INTEGER,
  },
  ImproveM: {
    type: Sequelize.INTEGER,
  },
  ReducedY: {
    type: Sequelize.INTEGER,
  },
  CostDetail: {
    type: Sequelize.STRING,
  },
  BfStep1: {
    type: Sequelize.STRING,
  },
  BfStep2: {
    type: Sequelize.STRING,
  },
  BfStep3: {
    type: Sequelize.STRING,
  },
  BfStep4: {
    type: Sequelize.STRING,
  },
  BfStep5: {
    type: Sequelize.STRING,
  },
  BfStep6: {
    type: Sequelize.STRING,
  },
  BfStep7: {
    type: Sequelize.STRING,
  },
  BfStep8: {
    type: Sequelize.STRING,
  },
  BfStep9: {
    type: Sequelize.STRING,
  },
  BfStep10: {
    type: Sequelize.STRING,
  },
  AfStep1: {
    type: Sequelize.STRING,
  },
  AfStep2: {
    type: Sequelize.STRING,
  },
  AfStep3: {
    type: Sequelize.STRING,
  },
  AfStep4: {
    type: Sequelize.STRING,
  },
  AfStep5: {
    type: Sequelize.STRING,
  },
  AfStep6: {
    type: Sequelize.STRING,
  },
  AfStep7: {
    type: Sequelize.STRING,
  },
  AfStep8: {
    type: Sequelize.STRING,
  },
  AfStep9: {
    type: Sequelize.STRING,
  },
  AfStep10: {
    type: Sequelize.STRING,
  },
  FilePic: {
    type: Sequelize.DataTypes.BLOB("long"),
  },
  FileType: {
    type: Sequelize.STRING,
  },
  URLlink: {
    type: Sequelize.STRING,
  },
  FromDate1: {
    type: Sequelize.STRING,
  },
  ToDate1: {
    type: Sequelize.STRING,
  },
  Detail1: {
    type: Sequelize.STRING,
  },
  FromDate2: {
    type: Sequelize.STRING,
  },
  ToDate2: {
    type: Sequelize.STRING,
  },
  Detail2: {
    type: Sequelize.STRING,
  },
  FromDate3: {
    type: Sequelize.STRING,
  },
  ToDate3: {
    type: Sequelize.STRING,
  },
  Detail3: {
    type: Sequelize.STRING,
  },
  FromDate4: {
    type: Sequelize.STRING,
  },
  ToDate4: {
    type: Sequelize.STRING,
  },
  Detail4: {
    type: Sequelize.STRING,
  },
  FromDate5: {
    type: Sequelize.STRING,
  },
  ToDate5: {
    type: Sequelize.STRING,
  },
  Detail5: {
    type: Sequelize.STRING,
  },
  Responsible: {
    type: Sequelize.STRING,
  },
  Status: {
    type: Sequelize.STRING,
  },
});
(async () => {
  await JobRequest_table.sync({ force: false }); //false,true
})();
module.exports = JobRequest_table;
