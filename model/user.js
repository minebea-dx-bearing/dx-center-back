const { Sequelize } = require("sequelize");
const database = require("../instance/ms_instance_center");
const user_table = database.define(
  "user",
  {
    username: { 
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "Required", 
        },
        len: {
          args: [4, 20], 
          msg: "String length is not in this range",
        },
      },
    },
    empNumber: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          args: true,
          msg: "Required",
        },
        len: {
          args: [4, 5],
          msg: "String length is not in this range",
        },
      },
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    division: { 
      type: Sequelize.STRING,
    },
    levelUser: { 
      type: Sequelize.STRING,
      defaultValue: "Guest",
      allowNull: false,
    },
  },
);
(async () => {
  await user_table.sync({ force: false }); //true,false
})();

module.exports = user_table;