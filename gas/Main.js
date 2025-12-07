// カレンダー → Notion → カレンダー説明欄にURL追記

function syncCalendarToNotion() {
  const config = getScriptConfig_();
  const cal = CalendarApp.getCalendarById(config.calendarId);

  if (!cal) {
    throw new Error('対象カレンダーが見つかりません: ' + config.calendarId);
  }

  const now = new Date();
  const until = new Date(now.getTime() + (24 * 60 * 60 * 1000) * 30 * 6); // 6ヶ月先まで
  const events = cal.getEvents(now, until);
  Logger.log('events count: ' + events.length);

  const MINUTES_KEYWORD = '#minutes_on';

  events.forEach(event => {
    const title = event.getTitle() || '';
    let desc = event.getDescription() || '';

    // 1) 説明欄に #minutes_on が無ければスキップ
    if (!desc.includes(MINUTES_KEYWORD)) {
      Logger.log('skip (no minutes keyword): ' + title);
      return;
    }

    // 2) すでに Notion URL が入っていればスキップ
    if (desc.includes('https://www.notion.so')) {
      Logger.log('skip (already has notion url): ' + title);
      return;
    }

    Logger.log('create notion page for event: ' + title);

    const notionUrl = createNotionPageFromEvent_(
      title,
      event.getStartTime(),
      event.getEndTime()
    );

    const appendText = '\n\nNotion 議事録ページ:\n' + notionUrl;
    event.setDescription(desc + appendText);
  });
}
