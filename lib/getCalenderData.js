const fetch = require('node-fetch');
const jsdom = require('jsdom');
const puppeteer = require('puppeteer');

const getSessionCookie = async (id, password) => {
    // TODO fetch利用
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://kyoumu.is.it-chiba.ac.jp/campusweb3.5/top.do')
        .catch((e) => {
            throw new Error('ログインページを取得できませんでした。ネットワークに接続されているか確認してください。', e);
        });
    await page.type('#userId', id);
    await page.type('#password', password);
    const waitUntilLoaded = page.waitForNavigation({ timeout: 60000, waitUntil: 'domcontentloaded' });
    await page.click('#loginButton');
    await waitUntilLoaded;
    const cookieObjects = await page.cookies();
    const isLogin = cookieObjects.some(cookie => cookie.name === 'PortalIDKEY');
    if (!isLogin) {
        throw new Error('ログインできませんでした。IDまたはパスワードが間違っています。');
    }
    browser.close();
    return cookieObjects.map(cookie => `${cookie.name}=${cookie.value}`).join('; ') + ';';
};

const getWeeklyCalenderHTML = (session) => {
    return fetch('https://kyoumu.is.it-chiba.ac.jp/campusweb3.5/wbassddr.do?contenam=wbassddr&buttonName=showJikanAll', {
        credentials: 'include',
        headers: { Cookie: session },
    }).then(response => response.text());
};

const parseCalenderHTMLToArray = (htmlParam) => {
    const transpose = a => a[0].map((_, c) => a.map(r => r[c]));
    const { document } = new jsdom.JSDOM(htmlParam).window;
    const tbody = document.getElementById('redrawArea');
    const rows = Array.prototype.slice.call(tbody.rows);
    const rules = rows.filter(row => /rule_[1-6]/.test(row.className));
    rules.pop(); // 10限が含まれるため。正規表現で対処したい。

    const weeklyTable = rules.map((rule) => {
        const cells = Array.prototype.slice.call(rule.cells);
        // n限目
        return cells.map((cell) => {
            if (cell.className !== 'item') {
                return 0; // ITEMではない(情報が入り得ない)セル
            }
            const classDetail = cell.childNodes[1].querySelector('td');
            if (!classDetail.querySelector('a')) {
                return null; // 履修していないコマ
            }

            const [className, place, teacherName] = classDetail.innerHTML
                .replace(/(\s)\1+|\n|<a.*?>|<\/a>/g, '') // 空白・不要タグのトリム
                .split('<br>');
            return { className, place, teacherName };
        });
    });
    return transpose(weeklyTable).filter(day => !day.some(cell => cell === 0));
};

const viewWeeklyData = (weeklyData) => {
    const weekJP = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
    weeklyData.forEach((oneDay, index) => {
        console.log(`${weekJP[index]}の履修項目`);
        oneDay.forEach((data) => {
            if (!data) return;
            const { className, teacherName, place } = data;
            console.log(`  * ${index + 1}限 ${className} \n    ${teacherName}  ${place}`);
        });
    });
};

module.exports = async (id, password) => {
    console.log('\u001b[36m', 'Logging in...', '\u001b[0m');
    const sessionCookies = await getSessionCookie(id, password)
        .catch((e) => {
            // ログインできなかった場合
            console.error(e);
            process.exit();
        });
    console.log('\u001b[36m', 'Getting Calender Data...', '\u001b[0m');
    const calenderHTML = await getWeeklyCalenderHTML(sessionCookies);
    const weeklyData = parseCalenderHTMLToArray(calenderHTML);
    viewWeeklyData(weeklyData);
    return weeklyData;
};
