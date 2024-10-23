<script>
  import { onMount, createEventDispatcher } from "svelte";
  import mapboxgl from "mapbox-gl";
  import * as turf from "turf";
  import Dropdown from "./Dropdown.svelte";
  import * as d3 from "d3";

  const dispatch = createEventDispatcher();

  export let all_polygons;
  export let country_dropdown;
  export let mygeojson;
  export let myallgeojson;
  export let labels_geojson;
  export let icon_data;

  let textSize = 10;
  let height;
  let icons = [];
  let map;
  let current_zoom = 2.5;

  function getIconSize() {
    if (window.innerWidth <= 768) {
      return { width: 17, height: 21 }; // Smaller size for small screens
    } else if (window.innerWidth <= 1000) {
      return { width: 20, height: 25 }; // Smaller size for small screens
    } else {
      return { width: 24, height: 30 }; // Smaller size for small screens
    }
  }

  function adjustMapForWindowSize() {
    let centerCoordinates = map.getCenter();
    if (window.innerWidth <= 768) {
      //adjust country label size
      textSize = 7;
      for (const icon of icons) {
        icon.style.width = "17px";
        icon.style.height = "21px";
      }
      current_zoom = 1.4;
      map.flyTo({
        center: [centerCoordinates.lng, centerCoordinates.lat],
        zoom: 1,
      });
    } else if (window.innerWidth <= 1000 || window.innerHeight <= 768) {
      textSize = 11;
      for (const icon of icons) {
        icon.style.width = "17px";
        icon.style.height = "21px";
      }
      current_zoom = 2.2;
      map.flyTo({
        center: [centerCoordinates.lng, centerCoordinates.lat],
        zoom: 2,
      });
    } else {
      textSize = 12;
      for (const icon of icons) {
        icon.style.width = "26px";
        icon.style.height = "32px";
      }
      current_zoom = 2.5;
      map.flyTo({
        center: [centerCoordinates.lng, centerCoordinates.lat],
        zoom: 2.5,
      });
    }
    // If the map has already loaded, update the layer text size
    if (map && map.getLayer("country-labels")) {
      map.setLayoutProperty("country-labels", "text-size", textSize);
    }
  }

  let imageURL = new URL("/norm_agt.png", import.meta.url).href;
  let localimageURL = new URL("/loc_agt.png", import.meta.url).href;
  let hoveredPolygonIdNoFatal = null;
  let hoveredPolygonIdFatal = null;

  onMount(() => {
    mapboxgl.accessToken =
      "pk.eyJ1Ijoic2FzaGFnYXJpYmFsZHkiLCJhIjoiY2xyajRlczBlMDhqMTJpcXF3dHJhdTVsNyJ9.P_6mX_qbcbxLDS1o_SxpFg";
    map = new mapboxgl.Map({
      container: map,
      attributionControl: false,
      style: "mapbox://styles/sashagaribaldy/cm0az6qe200pf01phd16v6qm0",
      center: [50.224518, 22.213995],
      zoom: 2.5,
      maxZoom: 5,
    });

    map.on("load", () => {
      //COUNTRIES WITHOUT FATALITIES
      map.addSource("no_fatalities", {
        type: "geojson",
        data: myallgeojson,
        generateId: true, //This ensures that all features have unique IDs
      });

      map.addLayer({
        id: "no_fatalities_fill",
        type: "fill",
        source: "no_fatalities",
        paint: {
          "fill-color": "#898989",
          "fill-opacity": 0.8,
        },
      });

      map.addLayer({
        id: "no_fatalities_outline",
        type: "line",
        source: "no_fatalities",
        layout: {},
        paint: {
          "line-color": "black",
          "line-width": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            1,
            0,
          ],
        },
      });

      //interactivity for no fatalities
      map.on("mousemove", "no_fatalities_fill", (e) => {
        map.getCanvas().style.cursor = "pointer";
        if (e.features.length > 0) {
          if (hoveredPolygonIdNoFatal !== null) {
            map.setFeatureState(
              { source: "no_fatalities", id: hoveredPolygonIdNoFatal },
              { hover: false },
            );
          }
          hoveredPolygonIdNoFatal = e.features[0].id;
          map.setFeatureState(
            { source: "no_fatalities", id: hoveredPolygonIdNoFatal },
            { hover: true },
          );
        }
      });

      // When the mouse leaves the state-fill layer, update the feature state of the
      // previously hovered feature.
      map.on("mouseleave", "no_fatalities_fill", () => {
        map.getCanvas().style.cursor = "";
        if (hoveredPolygonIdNoFatal !== null) {
          map.setFeatureState(
            { source: "no_fatalities", id: hoveredPolygonIdNoFatal },
            { hover: false },
          );
        }
        hoveredPolygonIdNoFatal = null;
      });

      map.on("click", "no_fatalities_fill", (e) => {
        let clicked_country = e.features[0].properties.ADMIN;
        let clicked_country_iso = e.features[0].properties.ISO_A3;
        zoomToCountry(clicked_country_iso);
        dispatch("polygonClick", [clicked_country, clicked_country_iso]);
      });

      //COUNTRIES WITH FATALITIES
      map.addSource("fatalities", {
        type: "geojson",
        data: mygeojson,
        generateId: true, //This ensures that all features have unique IDs
      });

      //draw extrusions based on fatalities
      map.addLayer({
        id: "fatalities_extrude",
        type: "fill-extrusion",
        source: "fatalities",
        paint: {
          "fill-extrusion-color": {
            property: "total_fatalities",
            stops: [
              [100, "#9F4544"],
              [10000, "#721B1B"],
              [100000, "#290a0a"],
            ],
          },
          "fill-extrusion-height": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            ["+", ["get", "total_fatalities"], 80000], // Add 70000 on hover
            ["get", "total_fatalities"], // Default height
          ],
          "fill-extrusion-base": 0,
          "fill-extrusion-opacity": 1,
        },
      });

      map.addLayer({
        id: "fatalities_fill",
        type: "fill",
        source: "fatalities",
        paint: {
          "fill-color": "black",
        },
      });

      let fatal_popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
      });

      function handleMouseMove(e) {
        let tooltip_text = mygeojson.features.find(
          (d) => d.properties.ADMIN == e.features[0].properties.ADMIN,
        );
        map.getCanvas().style.cursor = "pointer";
        if (e.features.length > 0) {
          if (hoveredPolygonIdFatal !== null) {
            map.setFeatureState(
              { source: "fatalities", id: hoveredPolygonIdFatal },
              { hover: false },
            );
          }
          hoveredPolygonIdFatal = e.features[0].id;
          map.setFeatureState(
            { source: "fatalities", id: hoveredPolygonIdFatal },
            { hover: true },
          );

          fatal_popup
            .setLngLat(e.lngLat)
            .setHTML(
              `<div style="color:black;  font-family:Montserrat; 
              line-height:1.2"><h3 style="margin-bottom:2px; margin-top:0px; 
              text-align:center">Conflict</h3>${tooltip_text.properties.tooltip}</div>`,
            )
            .addTo(map);
        }
      }

      map.on("mousemove", "fatalities_fill", handleMouseMove);

      // When the mouse leaves the state-fill layer, update the feature state of the
      // previously hovered feature.
      map.on("mouseleave", `fatalities_fill`, () => {
        map.getCanvas().style.cursor = "";
        if (hoveredPolygonIdFatal !== null) {
          map.setFeatureState(
            { source: "fatalities", id: hoveredPolygonIdFatal },
            { hover: false },
          );
        }
        hoveredPolygonIdFatal = null;
        fatal_popup.remove();
      });

      map.on("click", "fatalities_fill", (e) => {
        let clicked_country = e.features[0].properties.ADMIN;
        let clicked_country_iso = e.features[0].properties.ISO_A3;
        zoomToCountry(clicked_country_iso);
        dispatch("polygonClick", [clicked_country, clicked_country_iso]);
      });

      //ICONS FOR AGREEMENTS
      let popup; // Declare the popup variable outside the event listeners

      const { width, height } = getIconSize();

      for (const marker of icon_data.features) {
        const el = document.createElement("div");
        if (
          marker.properties.country === "Niger" ||
          marker.properties.country === "Nigeria" ||
          marker.properties.country === "Pakistan"
        ) {
          el.style.backgroundImage = `url(${localimageURL})`;
        } else {
          el.style.backgroundImage = `url(${imageURL})`;
        }
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;
        el.style.backgroundSize = "100%";
        el.style.cursor = "pointer";

        el.addEventListener("mouseover", () => {
          //remove fatalities listener
          map.off("mousemove", "fatalities_fill", handleMouseMove);

          // Create the popup and assign it to the popup variable
          popup = new mapboxgl.Popup({
            closeOnClick: false,
            closeButton: false,
          })
            .setLngLat(marker.geometry.coordinates)
            .setHTML(
              `<div style="color:black; font-family:Montserrat; line-height:1.2"">
                <h3 style="margin-bottom:2px; margin-top:0px; text-align:center">Agreement</h3>` +
                marker.properties.tooltip +
                `</div>`,
            )
            .addTo(map);
        });

        el.addEventListener("mouseout", () => {
          //return fatalities listener
          map.on("mousemove", "fatalities_fill", handleMouseMove);
          // Remove the popup when mouse leaves the element
          if (popup) {
            popup.remove();
          }
        });

        icons.push(el);

        new mapboxgl.Marker(el)
          .setLngLat(marker.geometry.coordinates)
          .addTo(map);
      }

      map.addSource("country-centroids", {
        type: "geojson",
        data: labels_geojson,
      });

      map.addLayer({
        id: "country-labels",
        type: "symbol",
        source: "country-centroids",
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Montserrat Light", "Arial Unicode MS Regular"],
          "text-size": textSize,
          "text-offset": [0, 0],
          "text-anchor": "center",
        },
        paint: {
          "text-color": "white", // Text color
        },
      });

      dispatch("mapLoaded");
    });

    adjustMapForWindowSize();
    window.addEventListener("resize", adjustMapForWindowSize);
  });

  function zoomToCountry(country) {
    let bound_box;
    if (country == "RUS") {
      bound_box = [
        68.1434025400001, 86.74555084800015, 97.36225305200006,
        35.49540557900009,
      ];
    } else if (country == "USA") {
      bound_box = [
        -160.3688042289999, 24.546282924364334, -36.7005916009999,
        32.71283640500015,
      ];
    } else if (country == "FRA") {
      bound_box = [
        -8.691314256999902, 40.909613348000065, 12.771169467000021, 50.84788646,
      ];
    } else {
      let countries = all_polygons.features;

      let the_country = countries.find(function (d) {
        return d.properties.ISO_A3 == country;
      });
      bound_box = turf.bbox(the_country);
    }

    if (bound_box) {
      map.fitBounds(bound_box, {
        padding: 50,
      });
    }
  }

  function flyToInitialPosition() {
    map.flyTo({ center: [50.224518, 22.213995], zoom: current_zoom });
    d3.select("h1").style("top", "-2px");
    d3.select(".visualization").style("right", "-100%");
  }

  function dropdownSelection(country) {
    zoomToCountry(country.detail[1]);
    dispatch("polygonClick", country.detail);
  }

  export { flyToInitialPosition };
</script>

<div class="map-container" bind:clientHeight={height}>
  <div id="map" bind:this={map}></div>
  <Dropdown {country_dropdown} on:close={dropdownSelection}/>
  <button id="refresh_button" on:click={flyToInitialPosition} title="Refresh">
    <i class="fa fa-refresh"></i>
  </button>
</div>

<style>
  .map-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  #map {
    width: 100%;
    height: 100%;
  }

  div {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
  }

  #refresh_button {
    position: absolute;
    top: 35px;
    right: 5px;
    background-color: white;
    border: 1px solid rgb(173, 173, 173);
    color: black;
    padding: 5px 16px;
    text-align: center;
    text-decoration: none;
    border-radius: 2px;
    display: inline-block;
    font-size: 1em;
    cursor: pointer;
    z-index: 10;
    width: 50px;
  }

  @media only screen and (max-width: 768px) {
    #refresh_button {
      font-size: 0.7em;
    }
  }

  @media only screen and (max-width: 500px) {
    #refresh_button {
      right: 1px;
      top: 27px;
      width: 40px;
      padding: 5px 10px;
      font-size: 0.7em;
    }
  }

  #refresh_button:hover {
    background-color: #aa4197;
    color: white;
  }

  :global(.mapboxgl-popup-content) {
    background-color: rgba(255, 255, 255, 0.932);
    width: 300px;
  }
</style>
