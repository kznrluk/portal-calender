const fetch = require('node-fetch');
const jsdom = require('jsdom');
const puppeteer = require('puppeteer');

const USER_DATA = {
    id: '',
    pass: '',
};

const getSessionCookie = async (userData) => {
    // TODO fetch利用
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://kyoumu.is.it-chiba.ac.jp/campusweb3.5/top.do')
        .catch((e) => {
            throw new Error('ログインページを取得できませんでした。ネットワークに接続されているか確認してください。', e);
        });
    await page.type('#userId', userData.id);
    await page.type('#password', userData.pass);
    await page.click('#loginButton');
    await page.waitForNavigation({ timeout: 60000, waitUntil: 'domcontentloaded' });
    const cookieObjects = await page.cookies();
    const isLogin = cookieObjects.some(cookie => cookie.name === 'PortalIDKEY');
    if (!isLogin) {
        throw new Error('ログインできませんでした。IDまたはパスワードが間違っています。');
    }
    browser.close();
    return `${cookieObjects.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')};`;
};

const getWeeklyCalenderHTML = (session) => {
    return fetch('https://kyoumu.is.it-chiba.ac.jp/campusweb3.5/wbassddr.do?contenam=wbassddr&buttonName=showJikanAll', {
        credentials: 'include',
        headers: { Cookie: session },
        method: 'GET',
    }).then(res => res.text());
};

const parseCalenderHTML = (htmlParam) => {
    const transpose = a => a[0].map((_, c) => a.map(r => r[c]));
    const html = new jsdom.JSDOM(htmlParam);
    const { document } = html.window;
    const tbody = document.getElementById('redrawArea');
    const rows = Array.prototype.slice.call(tbody.rows);
    const rules = rows.filter(row => /rule_[1-6]/.test(row.className));

    const weeklyTable = rules.map((rule) => {
        const cells = Array.prototype.slice.call(rule.cells);
        // n限目
        return cells.map((cell) => {
            // const info = cell.firstChild.firstChild.className;
            if (cell.className !== 'item') {
                // ITEMではない(情報が入り得ない)セル
                return 0;
            }
            const classDetail = cell.childNodes[1].querySelector('td');
            if (!classDetail.querySelector('a')) {
                // 履修していないコマ
                return null;
            }

            const [className, place, teacherName] = classDetail.innerHTML.replace(/(\s)\1+|\n|<a.*?>|<\/a>/g, '').split('<br>');
            return { className, place, teacherName };
        });
    });
    return transpose(weeklyTable).filter(day => !day.some(cell => cell === 0));
};

const viewWeeklyData = (data) => {
    const weekJP = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
    data.forEach((oneDay, index) => {
        console.log(`${weekJP[index]}の履修項目`);
        oneDay.forEach((data, index) => {
            if (data) {
                const {className, teacherName, place} = data;
                console.log(`  * ${index + 1}限 ${className} \n    ${teacherName}  ${place}`);
            }
        });
    });
};

const getCalenderData = async (userData) => {
    console.log('\u001b[36m', 'Logging in...', '\u001b[0m');
    const sessionCookies = await getSessionCookie(userData)
        .catch((e) => {
            // ログインできなかった場合
            console.error(e);
            process.exit();
        });
    console.log('\u001b[36m', 'Getting Calender Data...', '\u001b[0m');
    const calenderHTML = await getWeeklyCalenderHTML(sessionCookies);
    return parseCalenderHTML(calenderHTML);
};

getCalenderData(USER_DATA)
    .then((calender) => {
        viewWeeklyData(calender);
        console.log('------------------ JSON ------------------');
        console.log(JSON.stringify(calender, null, 4));
        console.log('------------------ END  ------------------');
    });
