# portal-calender
富士通製大学ポータルから履修情報を取得し、Googleカレンダーが読み込める形式(CSV)で出力します。

`node.js`のインストールが必要です。
```
npm install
node exportToGoogleCalendar.js
```

### config.json
```
{
  // ポータルログインに指定するユーザID
  "userId": "N1732000",
  // パスワード
  "password": "passwordHere",
  // カレンダーを作成する開始日(デフォルトでコマンド実行日)
  "createCalendarFrom": "2019-04-01",
  // カレンダーを作成する終了日(デフォルトでコマンド実行日+一週間)
  "createCalendarTo": "2019-08-01",
  // 出力ファイル名
  "fileName": "./export.csv"
}
```

`createCalendarFrom`と`createCalendarTo`を入力することで指定された期間の間繰り返しで予定を作成します。

これはGoogleカレンダー上で指定する繰り返しとは違い、単純に予定を指定日数分生成する処理を行うものです。そのため、Googleカレンダー上での一括編集には対応していません。

CSVをインポートする際は、他の予定が入っていない新しいカレンダーを作成してから行うのがおすすめです。

