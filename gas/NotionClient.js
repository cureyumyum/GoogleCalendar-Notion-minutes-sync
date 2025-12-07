// Notion 議事録ページ作成

function createNotionPageFromEvent_(summary, startTime, endTime) {
  const config = getScriptConfig_();
  const url = 'https://api.notion.com/v1/pages';

  const payload = {
    parent: {
      database_id: config.notionDatabaseId,
    },
    properties: {
      // タイトル列: Notion DB の "名前"（type: title）
      "名前": {
        title: [
          {
            text: {
              content: summary,
            },
          },
        ],
      },
      // 日付列: Notion DB の "日付"（type: date）
      "日付": {
        date: {
          start: startTime.toISOString(),
          end: endTime.toISOString(),
        },
      },
    },
  };

  const options = {
    method: 'post',
    headers: {
      'Authorization': 'Bearer ' + config.notionToken,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  const resp = UrlFetchApp.fetch(url, options);
  const statusCode = resp.getResponseCode();
  const bodyText = resp.getContentText();
  Logger.log('Notion response status: ' + statusCode);
  Logger.log('Notion response body: ' + bodyText);

  const json = JSON.parse(bodyText);

  if (statusCode >= 300) {
    throw new Error('Notion API error: ' + statusCode + ' ' + bodyText);
  }

  // ブラウザで開けるページURLを返す
  return json.url;
}
