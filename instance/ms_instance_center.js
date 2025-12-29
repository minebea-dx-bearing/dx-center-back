const Sequelize = require("sequelize");

const dbdx = new Sequelize({
    dialect: 'mssql',
    host: process.env.DX_SERVER,
    database: process.env.DX_DATABASE_NAME,
    username: process.env.DX_SERVER_USERNAME,
    password: process.env.DX_SERVER_PASSWORD,
    dialectOptions: {
        options: {
            instanceName: "NHTBEARING",
        }
    }
});

(async () => {
  try {
  await dbdx.authenticate();
        console.log("Database connection has been established successfully.");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
})();
module.exports = dbdx;