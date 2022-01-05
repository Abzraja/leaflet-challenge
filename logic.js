// We set the longitude, latitude, and starting zoom level.
var map = L.map("map", {
  center: [40.866667,34.566667], // I've used the center of the earth https://en.wikipedia.org/wiki/Geographical_centre_of_Earth
  zoom: 3,
});



// Pull GeoJSON Data
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var file = "PB2002_plates.json"
d3.json(url).then(function(data) {
  d3.json(file).then(function(platesdata) {
    console.log(data);
    console.log(platesdata);


    // basemaps
    let streets = L.tileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  } ).addTo( map )

    let grayscale = L.tileLayer.grayscale ('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

    let satellite = L.tileLayer ('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {attribution: 'Source: Esri, DigitalGlobe, GeoEye, i-cubed, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AEX, Getmapping, Aerogrid, IGN, IGP, swisstopo, and the GIS User Community'})

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    //function to color based on earthquake depth
    function getColor(d) {
      return d > 90  ? '#FF0D0D' :
             d > 70  ? '#FF4E11' :
             d > 50   ? '#FF8E15' :
             d > 30   ? '#FAB733' :
             d > 10   ? '#dfff00' :
             d > -10  ? '#63ff00':
                        '#FFEDA0';
    }
    
    //function to style the circlemarkers.
    function style(feature) {
      var depth = feature.geometry.coordinates.slice(2,3)
      var magnitude = feature.properties.mag
      return {
        fillOpacity: 0.8,
        weight: 1,
        color: "black",
        fillColor: getColor(depth),
        // Adjust the radius.
        radius: magnitude*5
      };
    }

    //function for popup boxes
    function onEachFeature(feature, layer) {
      var id = feature.id
      var title = feature.properties.title
      var place = feature.properties.place
      var time =  feature.properties.time
      var magnitude = feature.properties.mag
      var depth = feature.geometry.coordinates.slice(2,3)
      var date = new Date(time)
          layer.bindPopup(
                          `<h3 style="text-transform:uppercase;">ID: ${id}</h3>
                           <h3>Title: ${title} </h3>
                           <h3>Place: ${place}</h3>
                           <h3>Time: ${date}</h3>
                           <h3>Magnitude ${magnitude}</h3>
                           <h3>Depth ${depth}</h3>
                        `);
      }

      //Styling for tectonic plates
      var myStyle = {
        "fillColor": "#000000",
        "fillOpacity": 0,
        "color": "#ffc40c",
        "weight": 2,
        "opacity": 0.9
    };


  
    // plot Earthquakes using geoJSON data
    var earthquakes = L.geoJSON(data, {
      onEachFeature: onEachFeature,
      pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, style(feature));
      }
  })


    // Tectonic plates GEOJSON
   var plates = L.geoJSON(platesdata, {
        style: myStyle
   })
  //.addTo(map);

  // These options will appear in the control box that users click to show and hide layers
let basemapControl = {
  "Streets": streets, // an option to select a basemap (makes more sense if you have multiple basemaps)
  "Grayscale": grayscale,
  "Satellite": satellite,
  "Topography": topo,
}
let layerControl = {
  "Tectonic Plates": plates.addTo(map),
  "Earthquakes": earthquakes.addTo(map), // an option to show or hide the layer you created from geojson
}

    
// Add the control component, a layer list with checkboxes for operational layers and radio buttons for basemaps
L.control.layers( basemapControl, layerControl, {collapsed:false} ).addTo( map )



// Add the legend to the map
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [-10, 10, 30, 50, 70, 90],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map);
    

});
    
});