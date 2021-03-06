const moment = require('moment/moment');

module.exports = (tableData, startDate, endDate) => {
    const createDataFrom = startDate ? moment(startDate) : moment();
    const createDataTo = endDate ? moment(endDate) : createDataFrom.clone().add(1, 'week');

    const PERIODS = [
        { start: '9:00 AM', end: '10:40 AM' },
        { start: '10:50 AM', end: '12:10 AM' },
        { start: '1:10 PM', end: '2:40 PM' },
        { start: '2:50 PM', end: '4:20 PM' },
        { start: '4:30 PM', end: '6:40 PM' },
        { start: '6:10 PM', end: '7:40 PM' },
    ];

    const result = [];
    const HEADERS = ['Subject', 'Start Date', 'Start Time', 'End Date', 'End Time', 'Description', 'Location'];
    result.push(HEADERS.join(','));
    for (const currentDate = createDataFrom; currentDate.diff(createDataTo, 'days') !== 1; currentDate.add(1, 'days')) {
        // SUNDAY 0 to Saturday 6
        const currentDayOfWeek = currentDate.day();
        // TABLE_DATAは月曜日始まりのため
        if (tableData[currentDayOfWeek - 1]) {
            tableData[currentDayOfWeek - 1].forEach((period, index) => {
                if (period !== null) {
                    // 授業コマのみ
                    const { className, place, teacherName } = period;
                    const currentDateStr = currentDate.format('DD/MM/YYYY');
                    result.push(
                        `${className},${currentDateStr},${PERIODS[index].start},${currentDateStr},${PERIODS[index].end},${teacherName},${place}`,
                    );
                }
            });
        }
    }

    return result.join('\n');
};
