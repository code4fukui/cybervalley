//import { fetchOrLoad } from "https://js.sabae.cc/fetchOrLoad.js";
import { HTMLParser } from "https://js.sabae.cc/HTMLParser.js";
//import { Day } from "https://js.sabae.cc/DateTime.js";
import { CSV } from "https://js.sabae.cc/CSV.js";
import { ICAL } from "https://code4fukui.github.io/ICAL/ICAL.js";

const dom2text = (dom) => {
  const ss = [];
  const d2t = (dom) => {
    for (const c of dom.childNodes) {
      if (c.rawTagName == "a") {
        ss.push(c.text);
        ss.push(" " + c.getAttribute("href") + " ");
      } else {
        if (c.childNodes.length > 0) {
          d2t(c);
        } else {
          ss.push(c.text);
        }
      }
    }
  };
  d2t(dom);
  return ss.join("");
};

const html = await Deno.readTextFile("cyberfriday.html");
const dom = HTMLParser.parse(html);
const items = dom.querySelectorAll("#cybercalendar > div");
const list = [];
for (const item of items) {
  const txt = dom2text(item);
  const m = txt.indexOf(" ");
  const day = txt.substring(0, m);
  const n = txt.indexOf(" (");
  const name0 = n < 0 ? txt.substring(m + 1) : txt.substring(m + 1, n);
  const na = name0.indexOf(" at ");
  const location = na < 0 ? "" : name0.substring(na + 4);
  const name = na < 0 ? name0 : name0.substring(0, na);
  const description = n < 0 ? "" : txt.substring(n + 2, txt.length - 1).trim();
  const dtstart = day + "T19:00+09:00";
  const dtend = day + (name.indexOf("#41") >= 0 ? "T21:30+09:00" : "T22:00+09:00");

  list.push({ DTSTART: dtstart, DTEND: dtend, SUMMARY: name, LOCATION: location, DESCRIPTION: description });
}
console.log(list);
await Deno.writeTextFile("cyberfriday.csv", CSV.stringify(list));
await Deno.writeTextFile("cyberfriday.ics", ICAL.stringify(list));
