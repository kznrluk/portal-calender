const fs = require('fs');
const SETTING = require('./config');
const getCalenderData = require('./lib/getCalenderData');
const convertArrayToCSV = require('./lib/converArrayToCSV');

(async () => {
    const calenderData = await getCalenderData(SETTING.userId, SETTING.password);
    const csv = convertArrayToCSV(calenderData, SETTING.createCalendarFrom, SETTING.createCalendarTo);
    fs.writeFileSync(SETTING.fileName, csv);
    console.log('\u001b[36m', 'Done.', '\u001b[0m');
})();
