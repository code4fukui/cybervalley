# cybervalley

福井県のテックコミュニティ「CyberValley」のための静的ウェブサイトおよびデータツールキットです。インタラクティブなマップ、イベントカレンダー、WebGPUを活用したアニメーション背景を備えています。

## 公開サイト

**[https://cybervalley.jp/](https://cybervalley.jp/)**

このウェブサイトは、WebGPUを用いてパーティクルの銀河をシミュレートした、ダイナミックでインタラクティブな背景を備えています。アニメーションの上には、ネオンスタイルの「Cyber」と「Valley」のテキストが重ねられています。

## ✨ 主な機能

- **WebGPUアニメーション背景**: WebGPU (`setGalaxy.js`) で構築された、視覚的に印象的でインタラクティブな銀河のパーティクルシミュレーション。
- **インタラクティブなコミュニティマップ**: 福井エリアの関連団体や企業の位置をプロットしたLeaflet.jsのマップ (`cybervalley-map.js`)。
- **イベントのスクレイピングとカレンダー生成**: `cyberfriday.html`からイベントデータを解析し、`cyberfriday.csv`と標準的なiCalendarファイル (`cyberfriday.ics`) を自動生成するDenoスクリプト (`scrape.js`)。
- **CyberFridayイベントページ**: 定期開催されるテックミートアップ「CyberFriday」の専用ページ。BGMプレイヤーも組み込まれています。
- **静的イベントギャラリー**: 過去のイベントの静的HTMLフォトギャラリーを生成するシンプルなスクリプト (`make.js`) を同梱。

## 🛠️ 技術スタック

- **ランタイム**: [Deno](https://deno.land/)
- **フロントエンド**: HTML5、CSS、JavaScript (ES Modules)
- **グラフィックス**: パーティクル背景アニメーションに [WebGPU](https://www.w3.org/TR/webgpu/) を使用。
- **マッピング**: インタラクティブなマップに [Leaflet.js](https://leafletjs.com/) を使用。
- **データ解析**: HTML解析、CSV、およびiCalendarファイル生成用のJavaScriptライブラリ。

## 🚀 はじめに

本プロジェクトは静的ウェブサイトです。Denoスクリプトはデータメンテナンス（具体的にはイベントカレンダーの更新）に使用されます。

**必須要件:**
- [Deno](https://deno.land/manual/getting_started/installation) ランタイム

**イベントデータを更新するには:**

1. リポジトリをクローンします:
    ```bash
    git clone https://github.com/code4fukui/cybervalley.git
    cd cybervalley
    ```
2. `cyberfriday.html`内のイベントリストを更新します。
3. スクレイピングスクリプトを実行して`.csv`と`.ics`ファイルを再生成します:
    ```bash
    ./run.sh
    ```
4. 更新された静的ファイルをウェブサーバーにデプロイします。

## 📊 データと帰属

このプロジェクトは以下の外部リソースやデータソースを利用しています:

- **地図タイル**: [国土地理院 (Geospatial Information Authority of Japan)](https://maps.gsi.go.jp/development/ichiran.html)
- **BGM**: [suno.com](https://suno.com/) で作成
- **JavaScriptライブラリ**:
    - `https://js.sabae.cc/fetchOrLoad.js`
    - `https://js.sabae.cc/HTMLParser.js`
    - `https://js.sabae.cc/DateTime.js`
    - `https://js.sabae.cc/CSV.js`
    - `https://code4fukui.github.io/ICAL/ICAL.js`

## 📜 ライセンス

MIT License — 詳細は [LICENSE](LICENSE) を参照してください。
