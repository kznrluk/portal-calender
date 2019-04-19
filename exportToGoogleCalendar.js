const getCalenderData = require('./lib/getCalenderData');
const convertArrayToCSV = require('./lib/converArrayToCSV');
const fs = require('fs');

const USER_DATA = {
    id: '',
    pass: '',
};

const CONFIG = {
    start: '2019-04-19',
    end: '2019-07-25',
};

const fileName = 'export.csv';

(async () => {
    const calenderData = await getCalenderData(USER_DATA);
    const csv = convertArrayToCSV(calenderData, CONFIG.start, CONFIG.end);
    fs.writeFileSync(fileName, csv);
})();
