var imageContainerMargin = 70;  // Margin + padding
var geojson;
// This watches for the scrollable container
var scrollPosition = 0;
$('div#contents').scroll(function() {
  scrollPosition = $(this).scrollTop();
});

function initMap() {

  // This creates the Leaflet map with a generic start point, because code at bottom automatically fits bounds to all markers
  var map = L.map('map', {
    center: [0, 0],
    zoom: 5,
    zoomControl: false,
    scrollWheelZoom: true
  });

  L.control.zoom({
    position: 'topright'
}).addTo(map);

  // This displays a base layer map (other options available)
  var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}).addTo(map);

  
  // This loads the GeoJSON map data file from a local folder
  $.getJSON('data/story_map.geojson', function(data) {
    geojson = L.geoJson(data, {
      onEachFeature: function (feature, layer) {
        (function(layer, properties) {
          // This creates numerical icons to match the ID numbers
          // OR remove the next 6 lines for default blue Leaflet markers
          var numericMarker = L.ExtraMarkers.icon({
            icon: 'fa-number',
            number: feature.properties['id'],
            markerColor: 'blue'
          });
          layer.setIcon(numericMarker);

          // This creates the contents of each chapter from the GeoJSON data. Unwanted items can be removed, and new ones can be added
          var containerSource = $("#container-template").html();
          var containerTemplate = Handlebars.compile(containerSource);

          var output = {
            "containerId": 'container' + feature.properties['id'],
            "chapter": feature.properties['chapter'],
            "imgSrc": feature.properties['image'],
            "srcHref": feature.properties['source'],
            "srcText": feature.properties['source-credit'],
            "description": feature.properties['description']
          }
          var html = containerTemplate(output);
          $('#contents').append(html);

          var i;
          var areaTop = -100;
          var areaBottom = 0;

          // Calculating total height of blocks above active
          for (i = 1; i < feature.properties['id']; i++) {
            areaTop += $('div#container' + i).height() + imageContainerMargin;
          }

          areaBottom = areaTop + $('div#container' + feature.properties['id']).height();

          $('div#contents').scroll(function() {
            if ($(this).scrollTop() >= areaTop && $(this).scrollTop() < areaBottom) {
              $('.image-container').removeClass("inFocus").addClass("outFocus");
              $('div#container' + feature.properties['id']).addClass("inFocus").removeClass("outFocus");

              map.flyTo([feature.geometry.coordinates[1], feature.geometry.coordinates[0] ], feature.properties['zoom']);
            }
          });

          // Make markers clickable
          layer.on('click', function() {
            $("div#contents").animate({scrollTop: areaTop + 60 + "px"});//controls margins for explore and click in the panels
          });

        })(layer, feature.properties);
      }
    });

    $('div#container1').addClass("inFocus");
    $('#contents').append("<div class='space-at-the-bottom'><a href='#space-at-the-top'><i class='fa fa-chevron-up'></i></br><small>Top</small></a></div>");
    map.fitBounds(geojson.getBounds());
    geojson.addTo(map);

    var baseMaps = {
      "Imagery": Esri_WorldImagery
    };
    
    var overlayMaps = {
        "Points": geojson
    };

    var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

  });
}

initMap();

