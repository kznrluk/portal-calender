const getCalenderData = require('./lib/getCalenderData');
const convertArrayToCSV = require('./lib/converArrayToCSV');
const fs = require('fs');

const USER_DATA = {
    id: '',
    pass: '',
};

const fileName = 'export.csv';

(async () => {
    const calenderData = await getCalenderData(USER_DATA);
    const csv = convertArrayToCSV(calenderData);
    fs.writeFileSync(fileName, csv);
})();
