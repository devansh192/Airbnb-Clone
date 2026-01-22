mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
    container: 'map', // container ID
    center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 9 // starting zoom
});

//console.log(listing.coordinates);

const marker = new mapboxgl.Marker({color: "red"})
.setLngLat(listing.geometry.coordinates) // listing.geometry coordinates will be sent here
.setPopup(new mapboxgl.Popup({offset: 25})
.setHTML(`<h4>${listing.title}</h4><p>Exact location will be provided after booking!</p>`))
.addTo(map);

map.on("load", () => {
  const circle = turf.circle(coordinates, 0.5, {
    steps: 64,
    units: "kilometers"
  });

  map.addSource("listing-radius", {
    type: "geojson",
    data: circle
  });

  map.addLayer({
    id: "listing-radius-fill",
    type: "fill",
    source: "listing-radius",
    paint: {
      "fill-color": "#ff385c",
      "fill-opacity": 0.25
    }
  });

  map.addLayer({
    id: "listing-radius-outline",
    type: "line",
    source: "listing-radius",
    paint: {
      "line-color": "#ff385c",
      "line-width": 2
    }
  });
});
