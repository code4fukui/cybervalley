# cybervalley

> 日本語のREADMEはこちらです: [README.ja.md](README.ja.md)

A static website and data toolkit for CyberValley, a tech community in Fukui, Japan, featuring an interactive map, event calendar, and a WebGPU-powered animated background.

## Live Site

**[https://cybervalley.jp/](https://cybervalley.jp/)**

The website features a dynamic, interactive background simulating a galaxy of particles with WebGPU. Neon-styled text "Cyber" and "Valley" is overlaid on the animation.

## ✨ Features

-   **WebGPU Animated Background**: A visually striking, interactive particle simulation of a galaxy, built with WebGPU (`setGalaxy.js`).
-   **Interactive Community Map**: A Leaflet.js map (`cybervalley-map.js`) that plots the locations of affiliated organizations and companies in the Fukui area.
-   **Event Scraping & Calendar Generation**: A Deno script (`scrape.js`) that parses event data from `cyberfriday.html` to automatically generate `cyberfriday.csv` and a standard `cyberfriday.ics` iCalendar file.
-   **CyberFriday Event Page**: A dedicated page for the recurring "CyberFriday" tech meetup, complete with an embedded BGM player.
-   **Static Event Galleries**: Includes simple scripts (`make.js`) to generate static HTML photo galleries for past events.

## 🛠️ Tech Stack

-   **Runtime**: [Deno](https://deno.land/)
-   **Frontend**: HTML5, CSS, JavaScript (ES Modules)
-   **Graphics**: [WebGPU](https://www.w3.org/TR/webgpu/) for the particle background animation.
-   **Mapping**: [Leaflet.js](https://leafletjs.com/) for the interactive map.
-   **Data Parsing**: JavaScript libraries for HTML parsing, CSV, and iCalendar file generation.

## 🚀 Getting Started

This project is a static website. The Deno scripts are used for data maintenance, specifically for updating the event calendar.

**Requirements:**
-   [Deno](https://deno.land/manual/getting_started/installation) runtime

**To update event data:**

1.  Clone the repository:
    ```bash
    git clone https://github.com/code4fukui/cybervalley.git
    cd cybervalley
    ```
2.  Update the event list in `cyberfriday.html`.
3.  Run the scraping script to regenerate the `.csv` and `.ics` files:
    ```bash
    ./run.sh
    ```
4.  Deploy the updated static files to a web server.

## 📊 Data and Attribution

The project utilizes several external resources and data sources:

-   **Map Tiles**: [Geospatial Information Authority of Japan (国土地理院)](https://maps.gsi.go.jp/development/ichiran.html)
-   **Background Music**: Created with [suno.com](https://suno.com/)
-   **JavaScript Libraries**:
    -   `https://js.sabae.cc/fetchOrLoad.js`
    -   `https://js.sabae.cc/HTMLParser.js`
    -   `https://js.sabae.cc/DateTime.js`
    -   `https://js.sabae.cc/CSV.js`
    -   `~~https://code4fukui.github.io/ICAL/ICAL.js`~~ *(unavailable)*

## 📜 License

MIT License — see [LICENSE](LICENSE).