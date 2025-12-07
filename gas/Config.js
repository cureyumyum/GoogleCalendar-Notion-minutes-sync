// 環境変数の設定

function getScriptConfig_() {
  const props = PropertiesService.getScriptProperties();
  return {
    notionToken: props.getProperty('NOTION_TOKEN'),
    notionDatabaseId: props.getProperty('NOTION_DATABASE_ID'),
    calendarId: props.getProperty('TARGET_CALENDAR_ID'),
  };
}
