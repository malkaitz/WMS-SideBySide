function getLayerNames(layerLeft, layerRight) {
  var layerNameL = layerLeft.wmsParams.layers;
  var layerNameLText = layerNameL.slice(-4);
  layerNameLText == "8_00" ? (layerNameLText = "2000") : layerNameLText;
  $("#date").prepend(layerNameLText);

  var layerNameR = layerRight.wmsParams.layers;
  var layerNameRText = layerNameR.slice(-4);
  layerNameRText == "8_00" ? (layerNameRText = "2000") : layerNameRText;
  $("#dateR").prepend(layerNameRText);
}

function getWmsLeafletLayerObject(layerObjectsArray, wmsLayerName) {
  var uniqueLayerArray = [];
  $.each(layerObjectsArray, function (index, value) {
    var layerInDictName = LtileLayersArray[index].wmsParams.layers;
    if (layerInDictName == wmsLayerName) {
      uniqueLayerArray.push(LtileLayersArray[index]);
    }
  });
  return uniqueLayerArray[0];
}

function windowHl() {
  var h = window.innerHeight;
  if (h < 620) {
    $("#controlLeft").css("transform", toScale);
    $("#controlRight").css("transform", toScale);
    $("#date").css("transform", toScale);
    $("#dateR").css("transform", toScale);
    dateHght = 40 * ratioNb;
    $("#controlLeft").css("top", dateHght);
    $("#controlRight").css("top", dateHght);
  }
}

//get current year from layer right and left
function getCurrentLayerYear(layerSide) {
  //layerRight or layerLeft
  var currentLayerYear = []; //'2020'
  if (layerSide._url == osmTilesUrl) {
    currentLayerYear.push("OSM");
  } else if (layerSide._url == outdoorTilesUrl) {
    currentLayerYear.push("Outdoor");
  } else {
    $.each(wmsLayerNamesDict, function (key, value) {
      if (value == layerSide.wmsParams.layers) {
        currentLayerYear.push(key);
      }
    });
  }
  return currentLayerYear[0];
}

var wmsUrl = "https://idena.navarra.es/ogc/wms?";

var h = window.innerHeight;
var ratio = h / 800;
var ratioSt = String(ratio).slice(0, 3);
var ratioNb = Number(ratioSt);
var toScale = "scale" + "(" + ratioNb + "," + ratioNb + ")";

var map = L.map("map", {
  maxZoom: 21,
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

var osmTilesUrl = "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png";
var outdoorTilesUrl =
  "https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=934169b5416c460d9eb7717b532d0a7f";

var LOSM = L.tileLayer(osmTilesUrl, { attribution: "" });
var ROutdoor = L.tileLayer(outdoorTilesUrl, { maxZoom: 22 });

wmsLayerNamesDict = {
  //year:LayerName in wms
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
  1929: "ortofoto_2500_1929",
};

var yearLayerObjectArray = [];
$.each(wmsLayerNamesDict, function (key, value) {
  var yearLayerObject = {
    layers: value,
    format: "image/JPEG",
    maxZoom: 21,
    transparent: !1,
    version: "1.3.0",
    attribution: "",
  };
  yearLayerObjectArray.push(yearLayerObject);
});

//create tileLayer vars //LtileLayersArray[0].wmsParams.layers is the  layer name
var LtileLayersArray = [];
$.each(yearLayerObjectArray, function (index, value) {
  var tileLayer = L.tileLayer.wms(wmsUrl, value);
  LtileLayersArray.push(tileLayer);
});

var layerLeft = getWmsLeafletLayerObject(
  LtileLayersArray,
  "ortofoto_5000_2022"
).addTo(map);

var layerRight = getWmsLeafletLayerObject(
  LtileLayersArray,
  "ortofoto_10000_1957"
).addTo(map);

L.control.sideBySide(layerLeft, layerRight).addTo(map);

//add div legends  for layers in 'div.leaflet-sbs-divider', the middle line
$("<div/>").attr("id", "date").appendTo("div.leaflet-sbs-divider");
$("<div/>").attr("id", "dateR").appendTo("div.leaflet-sbs-divider");

getLayerNames(layerLeft, layerRight);

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

$(
  "#LOSM,#L2024,#L2023,#L2022,#L2021,#L2020,#L2019,#L2018,#L2017,#L2014,#L2013,#L2012,#L2011,#L2010,#L2009,#L2008,#L2006,#L2005,#L2004,#L2003,#L2000,#L1982,#L1966,#L1957,#L1945,#L1929"
).click(function () {
  var val = $("input.leaflet-sbs-range").prop("value");
  var divider = $("div.leaflet-sbs-divider").css("left");
  var clip1 = $("div.leaflet-layer:eq(0)").css("clip");
  var clip2 = $("div.leaflet-layer:eq(1)").css("clip");

  var layerNameL = $(this).attr("id"); //clicked checkbox  R2021
  var layerLeftYear = layerNameL.slice(1); //2020

  //check if is the same layer than right layer
  var currentRightYear = getCurrentLayerYear(layerRight);
  var currentLeftYear = getCurrentLayerYear(layerLeft);
  if (layerNameL.slice(1) == currentRightYear) {
    $("#L" + currentLeftYear).prop("checked", true);
    return;
  }

  map.removeLayer(layerLeft);

  $("div.leaflet-sbs").remove();

  //layerLeft = window[layerNameL];

  if (layerNameL != "LOSM") {
    layerLeft = getWmsLeafletLayerObject(
      LtileLayersArray,
      wmsLayerNamesDict[layerLeftYear]
    );
  } else {
    layerLeft = LOSM;
  }

  L.control.sideBySide(layerLeft, layerRight).addTo(map);

  $("<div/>").attr("id", "date").appendTo("div.leaflet-sbs-divider");
  $("<div/>").attr("id", "dateR").appendTo("div.leaflet-sbs-divider");

  if (h < 620) {
    $("#date").css("transform", toScale);
    $("#dateR").css("transform", toScale);
  }

  //add layer year label to map divs
  $("#date").prepend(layerNameL.slice(1));
  var currentRightYear = getCurrentLayerYear(layerRight);
  $("#dateR").prepend(currentRightYear);

  $("input.leaflet-sbs-range").prop("value", val);
  $("div.leaflet-sbs-divider").css("left", divider);
  //$("div.leaflet-layer:eq(0)").css("clip", clip1);
  //$("div.leaflet-layer:eq(1)").css("clip", clip2);

  map.addLayer(layerLeft);

  $("#controlLeft").animate({
    opacity: 0,
  });
});

var mapWidth = $("#map").width();

$("#controlLeft").hover(function () {
  if ($("#controlLeft").css("opacity") == 0) {
    $(".containerL").css("pointer-events", "none");
  } else {
    $(".containerL").css("pointer-events", "auto");
  }
});

$(
  "#ROutdoor,#R2024,#R2023,#R2022,#R2021, #R2020, #R2019,#R2018,#R2017,#R2014,#R2013,#R2012,#R2011,#R2010,#R2009,#R2008,#R2006,#R2005,#R2004,#R2003,#R2000,#R1982,#R1966,#R1957,#R1945,#R1929"
).click(function () {
  var val = $("input.leaflet-sbs-range").prop("value");
  var divider = $("div.leaflet-sbs-divider").css("left");
  var clip1 = $("div.leaflet-layer:eq(0)").css("clip");
  var clip2 = $("div.leaflet-layer:eq(1)").css("clip");

  var layerNameR = $(this).attr("id"); //clicked checkbox  R2021
  var layerRightYear = layerNameR.slice(1); //2020

  ///check if is the same layer than left layer

  var currentRightYear = getCurrentLayerYear(layerRight);
  var currentLeftYear = getCurrentLayerYear(layerLeft);
  if (layerNameR.slice(1) == currentLeftYear) {
    $("#R" + currentRightYear).prop("checked", true);
    return;
  }

  map.removeLayer(layerRight);

  if (layerNameR != "ROutdoor") {
    layerRight = getWmsLeafletLayerObject(
      LtileLayersArray,
      wmsLayerNamesDict[layerRightYear]
    );
  } else {
    layerRight = ROutdoor;
  }

  $("div.leaflet-sbs").remove();

  L.control.sideBySide(layerLeft, layerRight).addTo(map);

  $("<div/>").attr("id", "date").appendTo("div.leaflet-sbs-divider");
  $("<div/>").attr("id", "dateR").appendTo("div.leaflet-sbs-divider");

  if (h < 620) {
    $("#date").css("transform", toScale);
    $("#dateR").css("transform", toScale);
  }

  //getLayerNames(layerLeft, layerRight)
  $("#dateR").prepend(layerNameR.slice(1));
  var currentLeftYear = getCurrentLayerYear(layerLeft);
  $("#date").prepend(currentLeftYear);

  $("input.leaflet-sbs-range").prop("value", val);
  $("div.leaflet-sbs-divider").css("left", divider);

  map.addLayer(layerRight);

  $("#controlRight").animate({
    opacity: 0,
  });
});

var mapWidth = $("#map").width();

$("#controlLeft").hover(function () {
  if ($("#controlLeft").css("opacity") == 0) {
    $(".containerL").css("pointer-events", "none");
  } else {
    $(".containerL").css("pointer-events", "auto");
  }
});

$("#controlRight").hover(function () {
  if ($("#controlRight").css("opacity") == 0) {
    $(".containerR").css("pointer-events", "none");
  } else {
    $(".containerR").css("pointer-events", "auto");
  }
});

$("#controlLeft").click(function () {
  if ($("#controlLeft").css("opacity") == 0) {
    $(".containerL").css("pointer-events", "none");
  } else {
    $(".containerL").css("pointer-events", "auto");
  }
});

$("#controlRight").click(function () {
  if ($("#controlRight").css("opacity") == 0) {
    $(".containerR").css("pointer-events", "none");
  } else {
    $(".containerR").css("pointer-events", "auto");
  }
});

setInterval(function () {
  var LeftDivider = $("div.leaflet-sbs-divider").css("left");
  var RightDivider = $("div.leaflet-sbs-divider").css("right");
  $("div.headerL").css("width", LeftDivider);
  $("div.headerR").css("width", RightDivider);
}, 1);

windowHl();
