/*************************************************
 * GLOBAL STATE
 *************************************************/
let map;
let sideBySide;
let leftLayer;
let rightLayer;

/*************************************************
 * CONSTANTS
 *************************************************/
const WMS_URL = "https://idena.navarra.es/ogc/wms?";
const OSM_URL = "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OUTDOOR_URL =
  "https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=934169b5416c460d9eb7717b532d0a7f";

/*************************************************
 * YEAR → WMS LAYER DICTIONARY
 *************************************************/
const WMS_BY_YEAR = {
  2025: "ortofoto_5000_2025",
  2024: "ortofoto_5000_2024",
  2023: "ortofoto_5000_2023",
  2022: "ortofoto_5000_2022",
  2021: "ortofoto_5000_2021",
  2020: "ortofoto_5000_2020",
  2019: "ortofoto_5000_2019",
  2018: "ortofoto_5000_2018",
  2017: "ortofoto_5000_2017",
  2014: "ortofoto_5000_2014",
  2013: "ortofoto_5000_2013",
  2012: "ortofoto_5000_2012",
  2011: "ortofoto_5000_2011",
  2010: "ortofoto_5000_2010",
  2009: "ortofoto_5000_2009",
  2008: "ortofoto_5000_2008",
  2006: "ortofoto_5000_2006",
  2005: "ortofoto_5000_2005",
  2004: "ortofoto_5000_2004",
  2003: "ortofoto_5000_2003",
  2000: "ortofoto_5000_98_00",
  1982: "ortofoto_5000_1982",
  1966: "ortofoto_5000_1966",
  1957: "ortofoto_10000_1957",
  1945: "ortofoto_10000_1945",
  1929: "ortofoto_2500_1929"
};

/*************************************************
 * MAP INIT
 *************************************************/
map = L.map("map", {
  maxZoom: 21,
  preferCanvas: true
}).setView([42.81, -1.65], 13);

L.control
  .locate({
    strings: {
      title: "¿dónde estoy?",
    },
  })
  .addTo(map);

flag =
  '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg"  width="12" height="8">' +
  '<path fill="#4C7BE1" d="M0 0h12v4H0z"></path>' +
  '<path fill="#FFD500" d="M0 4h12v3H0z"></path>' +
  '<path fill="#E0BC00" d="M0 7h12v1H0z"></path>';
("</svg>");

span = "<span>&nbsp</span>";

map.attributionControl.addAttribution(
  '<a href="https://www.digital-democracy.org/" target="_blank">Digital Democracy</a>' +
    " | " +
    '<a href="https://www.cfnavarra.es/obraspublicas/" target="_blank" >GN</a>'
);

//insert flag in attribution
$(".leaflet-control-attribution.leaflet-control").prepend(span);
$(".leaflet-control-attribution.leaflet-control").prepend(flag);

L.control
  .scale({
    imperial: !1,
  })
  .addTo(map);

map.addControl(
  new L.Control.Fullscreen({
    title: {
      false: "View Fullscreen",
      true: "Exit Fullscreen",
    },
  })
);

L.Control.Watermark = L.Control.extend({
  onAdd: function (map) {
    var img = L.DomUtil.create("img");
    img.src = "./images/logo.png";
    img.style.width = "125px";
    img.onclick = function () {
      window.open("https://www.napargis.com/noain/index.html");
    };
    img.style.cursor = "pointer";
    return img;
  },
  onRemove: function (map) {},
});

L.control.watermark = function (opts) {
  return new L.Control.Watermark(opts);
};

L.control
  .watermark({
    position: "bottomright",
  })
  .addTo(map);

/*************************************************
 * BASE LAYERS
 *************************************************/
const OSM = L.tileLayer(OSM_URL);
const Outdoor = L.tileLayer(OUTDOOR_URL, { maxZoom: 22 });

/*************************************************
 * WMS LAYER FACTORY (CRITICAL FIX)
 *************************************************/
function createWmsLayer(layerName) {
  return L.tileLayer.wms(WMS_URL, {
    layers: layerName,
    format: "image/jpeg",
    version: "1.3.0",
    transparent: false,
    maxZoom: 21,
    crs: L.CRS.EPSG3857,

    // stability
    updateWhenIdle: true,
    updateWhenZooming: false,
    keepBuffer: 2,
    reuseTiles: true,
    unloadInvisibleTiles: true
  });
}

/*************************************************
 * INITIAL LAYERS
 *************************************************/
leftLayer = createWmsLayer(WMS_BY_YEAR[2022]).addTo(map);
rightLayer = createWmsLayer(WMS_BY_YEAR[1957]).addTo(map);

/*************************************************
 * SIDE BY SIDE (CREATE ONCE)
 *************************************************/
sideBySide = L.control.sideBySide(leftLayer, rightLayer).addTo(map);

/*************************************************
 * LABELS
 *************************************************/
$("<div id='date'></div>").appendTo(".leaflet-sbs-divider").text("2022");
$("<div id='dateR'></div>").appendTo(".leaflet-sbs-divider").text("1957");


/*************************************************
 * SAFE LAYER SWITCHING
 *************************************************/
function setLeftLayer(layer) {
  map.removeLayer(leftLayer);
  leftLayer = layer;
  map.addLayer(leftLayer);
  sideBySide.setLeftLayers(leftLayer);
}

function setRightLayer(layer) {
  map.removeLayer(rightLayer);
  rightLayer = layer;
  map.addLayer(rightLayer);
  sideBySide.setRightLayers(rightLayer);
}

/*************************************************
 * UI EVENTS – LEFT
 *************************************************/
$("[id^=L]").on("click", function () {
  const year = $(this).attr("id").slice(1);

  if (year === "OSM") {
    setLeftLayer(OSM);
    $("#date").text("OSM");
  } else {
    setLeftLayer(createWmsLayer(WMS_BY_YEAR[year]));
    $("#date").text(year);
  }
});

/*************************************************
 * UI EVENTS – RIGHT
 *************************************************/
$("[id^=R]").on("click", function () {
  const year = $(this).attr("id").slice(1);

  if (year === "Outdoor") {
    setRightLayer(Outdoor);
    $("#dateR").text("Outdoor");
  } else {
    setRightLayer(createWmsLayer(WMS_BY_YEAR[year]));
    $("#dateR").text(year);
  }
});

/*************************************************
 * DIVIDER → HEADER SYNC (NO setInterval!)
 *************************************************/
map.on("move zoom", function () {
  const left = $(".leaflet-sbs-divider").css("left");
  const right = $(".leaflet-sbs-divider").css("right");
  $(".headerL").css("width", left);
  $(".headerR").css("width", right);
});


$(document).ready(function () {
  $("#map").on("mouseover click", "#date", function () {
    if ($("#controlLeft").css("opacity") == 0) {
      $("#controlLeft").animate({
        opacity: 1,
      });
    } else {
      $("#controlLeft").animate({
        opacity: 0,
      });
    }
  });
});

$(document).ready(function () {
  $("#map").on("mouseover click", "#dateR", function () {
    if ($("#controlRight").css("opacity") == 0) {
      $("#controlRight").animate({
        opacity: 1,
      });
    } else {
      $("#controlRight").animate({
        opacity: 0,
      });
    }
  });
});

$("#controlLeft").mouseleave(function () {
  if ($("#controlLeft").css("opacity") == 1) {
    $("#controlLeft").animate({
      opacity: 0,
    });
  }
});

$("#controlRight").mouseleave(function () {
  if ($("#controlRight").css("opacity") == 1) {
    $("#controlRight").animate({
      opacity: 0,
    });
  }
});

$("#controlLeft").click(function () {
  if ($("#controlLeft").css("opacity") == 1) {
    $("#controlLeft").animate({
      opacity: 0,
    });
  }
});

$("#controlRight").click(function () {
  if ($("#controlRight").css("opacity") == 1) {
    $("#controlRight").animate({
      opacity: 0,
    });
  }
});

//-------------------------------------------------------

// Monitor SBS divider dragging
$("input.leaflet-sbs-range").on("input", function () {
  
  const left = $(".leaflet-sbs-divider").css("left");
  const right = $(".leaflet-sbs-divider").css("right");
  $(".headerL").css("width", left);
  $(".headerR").css("width", right);
}
);







