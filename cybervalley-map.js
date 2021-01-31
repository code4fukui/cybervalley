import L from 'https://code4sabae.github.io/leaflet-mjs/leaflet.mjs'

window.onload = async () => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://code4sabae.github.io/leaflet-mjs/leaflet.css";
  document.head.appendChild(link);
  
  const data = [
    { lat: 36.065006, lng: 136.221746, name: "福井県庁", link: "https://www.pref.fukui.lg.jp/index3.html" },
    // { lat: 35.943560, lng: 136.188917, name: '鯖江駅' },
    { lat: 36.077170, lng: 136.215853, name: "サイエンスカフェ", link: "http://tannan.fm/contents/science-cafe.html" },
    { lat: 35.944539, lng: 136.186222, name: 'Hana道場', link: "https://hanadojo.com" },
    { lat: 35.942795, lng: 136.198881, name: 'さばえSDGs推進センター', link: "https://www.sabae-sdgs.jp/" },
    // { lat: 35.949658, lng: 136.258142, name: 'JAPAN CRAFT HOUSE' },
    { lat: 35.946878, lng: 136.183446, name: "SCC", link: "https://sabae.cc/" },
    { lat: 35.946201, lng: 136.185211, name: "tannan.fm", link: "http://tannan.fm/" },
    { lat: 36.0755056, lng: 136.4912707, name: "PCN勝山", link: "http://fukui.pcn.club/katsuyama/" },
    { lat: 35.947436, lng: 136.183460, name: "コネクトフリー株式会社", link: "https://connectfree.co.jp/" },
    { lat: 36.0533175, lng: 136.2496007, name: "株式会社アフレル", link: "https://afrel.co.jp/" },
    { lat: 36.0545894, lng: 136.2458145, name: "株式会社ナチュラルスタイル", link: "https://na-s.jp/" },
    { lat: 36.0545894, lng: 136.2458145, name: "株式会社ict4e", link: "https://ict4e.jp/" },
  ];

  const map = L.map('mapdiv')
  // set 国土地理院地図 https://maps.gsi.go.jp/development/ichiran.html
  // const mapurl = "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png";
  const mapurl = "https://maps.gsi.go.jp/xyz/d1-no898/{z}/{x}/{y}.png";
  L.tileLayer(mapurl, {
    attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>"',
  }).addTo(map);

  let iconlayer = L.layerGroup();
  iconlayer.addTo(map);
  const lls = [];
  for (const item of data) {
    const ll = [ item.lat, item.lng ];
    const marker = L.marker(ll); // , { title: `<a href=${item.name}>t</a>` });
    marker.bindPopup(`<a href=${item.link}>${item.name}</a>`);
    iconlayer.addLayer(marker);
    lls.push(ll);
  }
  if (lls.length) {
    map.fitBounds(lls);
  }
  map.setZoom(10);
};

