const cron = require("node-cron");
const autoAssignDriver = require("../utils/autoAssignDriver");

const rideCron = () => {

    // Run every 30 seconds (better than 1 min for real-time feel)
    cron.schedule("*/30 * * * * *", async () => {
        console.log("⏱ Running ride assignment cron...");
        await autoAssignDriver();
    });

};

module.exports = rideCron;