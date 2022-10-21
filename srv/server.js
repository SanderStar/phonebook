const oCds = require("@sap/cds");
const oProxy = require("@sap/cds-odata-v2-adapter-proxy");

oCds.on("bootstrap", (oApp) => oApp.use(oProxy()));
module.exports = oCds.server;