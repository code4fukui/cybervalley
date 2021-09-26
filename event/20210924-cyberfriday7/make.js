import { dir2array } from "https://js.sabae.cc/dir2array.js";

const files = (await dir2array("./")).filter(f => f.endsWith(".jpg"));

const s = `<!DOCTYPE html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<link rel="stylesheet" type="text/css" href="style.css">
<link rel="preconnect" href="https://fonts.gstatic.com">
<link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;500&display=swap" rel="stylesheet">
<title>CyberFriday #7</title>
</head>
<body>
<h1>CyberFriday #7</h1>
${files.map(f => `<a href=${f} target=_blank><img src=${f}></a>`).join("\n")}

<footer>
<a href=https://cybervalley.jp/>CyberValley, Japan</a><br>
</footer>
</body>
</html>`;

await Deno.writeTextFile("index.html", s);
