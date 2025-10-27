const Sequelize = require("sequelize");

const dbms = new Sequelize({
    dialect: 'mssql',
    host: process.env.NMB_SERVER,
    username: process.env.NMB_SERVER_USERNAME,
    password: process.env.NMB_SERVER_PASSWORD,
    dialectOptions: {
        options: {
            instanceName: "",
        }
    }
});

(async () => {
    try {
        await dbms.authenticate();
        console.log("Database connection has been established successfully.");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
})();

module.exports = dbms;
