# GoogleCalendar-Notion-minutes-sync

GoogleカレンダーのイベントからNotionの議事録ページを自動作成し、相互リンクを形成するオートメーションツールです。
クライアントサイド（Chrome拡張機能）とサーバーサイド（Google Apps Script）のモノレポ構成で管理されています。

## 📖 概要

会議の予定作成時に「議事録作成」をONにすると、バックグラウンドでNotionデータベースにページを作成し、そのURLをGoogleカレンダーの説明欄に自動追記します。

## 🎥 デモ：実際の動作

https://github.com/user-attachments/assets/02153ffc-0710-478e-ab2b-26ffaba65bbe

### 主な機能

1. **UI拡張**: Googleカレンダーの予定作成ダイアログに、議事録作成用のトグルスイッチ（`#minutes_on`タグ挿入用）を追加。
2. **自動同期**: 定期実行されるGASがタグ付きの予定を検知し、Notionデータベースにページを作成（タイトル・日時）。
3. **相互リンク**: 作成されたNotionページのURLを、Googleカレンダーの予定の説明欄に自動で書き戻し。

## 📂 ディレクトリ構成

```
gcal-notion-minutes-sync/
├── chrome-extension/      # クライアントサイド: Chrome拡張機能
│   ├── manifest.json      # Manifest V3 定義
│   └── content-script.js  # トグルUI注入スクリプト
│
├── gas/                   # サーバーサイド: Google Apps Script
│   ├── Config.js          # 環境変数管理
│   ├── NotionClient.js    # Notion API 通信ロジック
│   └── Main.js            # 同期処理エントリーポイント
│
└── README.md
```

## 🚀 セットアップ手順

### 1. 前提条件 (Notion API)

1. [Notion My Integrations](https://www.notion.so/my-integrations) で新しいインテグレーションを作成し、`Internal Integration Token` を取得する。
2. 議事録を保存したいNotionデータベースを用意し、右上のメニューから「Add connections」で作成したインテグレーションを追加する。
3. データベースID（URLの `notion.so/{workspace_name}/{database_id}?v=...` の部分）を控える。

### 2. Google Apps Script (Backend) の設定

1. `gas/` 内のコードを新しいGASプロジェクトにコピペする。
2. **スクリプトプロパティ**を設定する（[プロジェクトの設定] > [スクリプトプロパティ]）。
    - `NOTION_TOKEN`: Notionのインテグレーションシークレット
    - `NOTION_DATABASE_ID`: 保存先のデータベースID
    - `TARGET_CALENDAR_ID`: 監視対象のカレンダーID（通常はメールアドレス）
3. **トリガー**を設定する。
    - 実行する関数: `syncCalendarToNotion`
    - イベントのソース: カレンダーから
    - カレンダーの詳細: カレンダー更新済み

### 3. Chrome拡張機能 (Frontend) の導入

1. Chromeブラウザで `chrome://extensions/` を開く。
2. 右上の「デベロッパーモード」をONにする。
3. 「パッケージ化されていない拡張機能を読み込む」をクリック。
4. 本リポジトリの `chrome-extension` ディレクトリを選択する。

## 📝 使用方法

1. **予定の作成**:
Googleカレンダーで予定作成画面を開きます。説明欄の下部に「議事録(Notion)ページの自動追加」というトグルが表示されます。
2. **トグルON**:
トグルをONにすると、説明欄の末尾に `#minutes_on` というタグが挿入されます（タグは保存時に見えますが、そのままでOKです）。
3. **同期実行**:
GASのトリガーが実行されると（例: 予定作成時）、Notionにページが作成されます。
4. **URL反映**:
Googleカレンダーの説明欄に `Notion 議事録ページ: https://notion.so/...` が追記されます。

## 🛠 技術スタック

- **Frontend**: Chrome Extension (Manifest V3), Vanilla JS
- **Backend**: Google Apps Script (GAS)
- **API**: Notion API (v2022-06-28)

## ⚠️ 注意事項

- **言語設定について**:
  本ツールはGoogleカレンダーおよびNotionの言語設定が**日本語**であることを前提に設計されています。
  （Chrome拡張機能が画面上の「説明」などの日本語ラベルを探索して動作するため、英語環境などではトグルが表示されません）
- カレンダーの説明欄にある `#minutes_on` タグは削除しないでください。同期のマーカーとして使用しています。
- すでにNotion URLが説明欄に含まれている予定は、二重作成防止のためスキップされます。