<script>
  import { onMount } from "svelte";
  import Map from "./lib/Map.svelte";
  import Visualization from "./lib/Visualization.svelte";
  import Info from "./lib/Info.svelte";
  import * as d3 from "d3";
  import { getGeo, getCSV } from "./utils";

  let vh;
  let width;
  let height;
  let mapRef;
  let mapLoaded = false;
  let selectedProperties;
  let path;
  let legend_height = 80;
  let loc_legend_height = 80;
  let legend_width = 200;

  //recalculate screen size
  function updateVH() {
    vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);

    //change logo and legend size on different screens
    if (window.innerWidth <= 768) {
      path = "./PeaceRep_Icon_nobg.jpg";
      legend_height = 40;
      loc_legend_height = 40;
      legend_width = 120;
    } else {
      path = "./PeaceRep_nobg.png";
      legend_height = 80;
      loc_legend_height = 80;
      legend_width = 200;
    }
  }

  //INIT FUNCTION
  onMount(() => {
    // Set initial vh value based on window.innerHeight
    updateVH();
    // Add a resize event listener to recalculate on orientation change or resize
    window.addEventListener("resize", updateVH);
    // Force a re-render after a short delay to catch any UI shifts
    setTimeout(updateVH, 150);
  });

  //map loaded, show start button
  function handleMapLoaded() {
    mapLoaded = true;
    document.getElementById("loading_text").style.visibility = "hidden";
    document.getElementById("loading_button").style.visibility = "visible";
  }

  //clicking on screen or button after map is loaded
  function handleScreenClick(event) {
    // Recalculate width and height
    width = window.innerWidth;
    height = window.innerHeight;

    if (mapLoaded) {
      document.getElementById("loading_screen").style.visibility = "hidden";
      document.getElementById("loading_button").style.visibility = "hidden";
    }
  }

  // LOAD CSV FILES
  let last_update_legend;
  let polygon_data;
  let country_data;
  let icon_data;
  let csv_path = [
    "./data/filled_polygon_data_5.csv",
    "./data/country_data.csv",
    "./data/agt_point_data.csv",
  ];

  getCSV(csv_path).then((data) => {
    polygon_data = data[0]; // contains last update
    country_data = data[1]; // contains tooltip for fatal on hover

    last_update_legend = polygon_data[0].last_update;

    //build geojson object for agreement icons
    let icon_geojson = [];
    data[2].forEach(function (d) {
      let to_push = {
        type: "Feature",
        properties: {
          country: d.Country_entity,
          iso: d.iso_code,
          tooltip: d.point_tooltip,
          iconSize: [25, 25],
        },
        geometry: {
          type: "Point",
          coordinates: [+d.central_longitude, +d.central_latitude],
        },
      };
      icon_geojson.push(to_push);
    });

    icon_data = {
      type: "FeatureCollection",
      features: icon_geojson,
    };
  });

  // LOAD CENTRAL POINTS
  let labels_geojson;
  let central_path = "/data/central_points.json";
  getGeo(central_path).then((geo) => {
    labels_geojson = geo;
  });

  // LOAD GEOJSON
  let all_polygons;
  let mygeojson;
  let myallgeojson;
  let country_dropdown;
  const json_path = "/data/country_polygons.json";
  let scaleHeight = d3.scaleLinear().domain([1, 10000]).range([1, 100000]);

  getGeo(json_path).then((geo) => {
    all_polygons = geo;
    //array of fatalities countries
    const isoA3Map = polygon_data.reduce((acc, country) => {
      acc[country.iso3c] = country;
      return acc;
    }, {});

    //remove countries not in above array and add fatalities to geojson
    const fatalities_geojson = {
      ...geo,
      features: geo.features
        .filter((feature) => isoA3Map[feature.properties.ISO_A3]) // Keep only matching features
        .map((feature) => {
          // Add total_fatalities to each feature
          feature.properties.total_fatalities = scaleHeight(
            +isoA3Map[feature.properties.ISO_A3].total_fatalities,
          );
          feature.properties.tooltip =
            isoA3Map[feature.properties.ISO_A3].polygon_tooltip;
          return feature;
        }),
    };
    mygeojson = fatalities_geojson;

    //country names array
    country_dropdown = country_data.map((country) => ({
      name: country.name,
      iso_code: country.iso_code,
    }));

    //all and fatalities arrays
    const iso3all = country_data.map((country) => country.iso_code);
    const iso3fatal = polygon_data.map((country) => country.iso3c);
    //remove fatalities from all array
    const resultArray = iso3all.filter((iso3) => !iso3fatal.includes(iso3));
    //remove features from all geojson
    const filteredFeatures = geo.features.filter((feature) =>
      resultArray.includes(feature.properties.ISO_A3),
    );

    myallgeojson = {
      type: "FeatureCollection",
      features: filteredFeatures,
    };
  });

  function handlePolygonClick(event) {
    selectedProperties = event.detail[1];
    d3.select("h1").style("top", "-50px");
    d3.select(".visualization").style("right", "0px");
  }

  let selected_country_details;
  $: if (selectedProperties) {
    selected_country_details = country_data.find(function (d) {
      return d.iso_code == selectedProperties;
    });
  }

  function openInformation() {
    d3.select(".information").style("right", "0px");
    d3.select(".visualization").style("right", "-100%");
  }

  function handleClose() {
    d3.select(".visualization").style("right", "-100%");
    d3.select(".information").style("right", "-100%");
  }

  function openTracker() {
    window.open("https://pax.peaceagreements.org/tracker/", "_blank");
  }
</script>

<main
  bind:clientWidth={width}
  bind:clientHeight={height}
  style="height: calc(var(--vh, 1vh) * 100);"
>
  <div
    role="presentation"
    id="loading_screen"
    style="height: calc(var(--vh, 1vh) * 100);"
    on:click={handleScreenClick}
  >
    <button id="loading_button" on:click={handleScreenClick} 
      >PA-X Tracker Globe</button
    >
    <p id="loading_text">loading...</p>
  </div>

  <h1>PA-X Tracker Globe</h1>

  <!-- <a href="https://peacerep.org/" target="_blank" title="Visit PeaceRep Website"
    ><img id="logo" alt="PeaceRep Logo" src={path} /></a
  > -->

  <button id="tracker_button" on:click={openTracker} title="Go to PA-X Tracker"> TRACKER </button>

  <button id="info_button" on:click={openInformation} title="Information">
    <i class="fa fa-info"></i>
  </button>

  {#if mygeojson && myallgeojson && icon_data}
    <Map
      {mygeojson}
      {myallgeojson}
      {labels_geojson}
      {icon_data}
      {all_polygons}
      {country_dropdown}
      bind:this={mapRef}
      on:polygonClick={handlePolygonClick}
      on:mapLoaded={handleMapLoaded}
    />
  {/if}

  <Info on:close={handleClose} />
  <div id="agt_legend">
    <h4>Agreement</h4>
    <svg
      height={loc_legend_height}
      width={legend_width}
      viewBox="0 0 200 90"
      preserveAspectRatio="xMidYMid meet"
    >
      <image href="./norm_agt.png" x="80%" y="3%" width="18%" height="28%" />
      <text
        x="0%"
        y="25%"
        fill="black"
        font-size="12"
        font-weight="400"
        text-anchor="start"
      >
        Agreement in 2023
      </text>

      <image href="./loc_agt.png" x="80%" y="36%" width="18%" height="28%" />
      <text
        x="0%"
        y="55%"
        fill="black"
        font-size="12"
        font-weight="400"
        text-anchor="start"
      >
        Local agreement in 2023
      </text>

      <rect x="84%" y="69%" width="10%" rx="1" height="25%" fill="#A1A1A2" />
      <text
        x="0%"
        y="85%"
        fill="black"
        font-size="12"
        font-weight="400"
        text-anchor="start"
      >
        Agreement since 1990
      </text>
    </svg>
  </div>

  <div id="legend">
    <h4>Conflict</h4>
    <svg
      height={legend_height}
      width={legend_width}
      viewBox="0 0 200 90"
      preserveAspectRatio="xMidYMid meet"
    >
      <rect x="2.5%" y="60%" width="25%" height="5%" fill="#CD9E9D" />
      <rect x="27.5%" y="40%" width="25%" height="25%" fill="#A26F6F" />
      <rect x="52.5%" y="20%" width="25%" height="45%" fill="#932A2A" />
      <rect x="77.5%" y="0%" width="25%" height="65%" fill="#311110" />

      <rect
        id="legend_rectangle"
        x="2.5%"
        y="67%"
        width="100%"
        height="15%"
        fill="url(#legend_gradient)"
      />

      <defs>
        <linearGradient id="legend_gradient">
          <stop class="stop_one" offset="0%" />
          <stop class="stop_two" offset="50%" />
          <stop class="stop_three" offset="100%" />
        </linearGradient>
      </defs>

      <text
        x="2.5%"
        y="96%"
        fill="black"
        font-size="12"
        font-weight="400"
        text-anchor="start"
      >
        less fatalities
      </text>

      <text
        x="99%"
        y="96%"
        fill="black"
        font-size="12"
        font-weight="400"
        text-anchor="end"
      >
        more fatalities
      </text>
    </svg>
  </div>
  <div id="update">Last 12 months of fatalities from {last_update_legend}</div>

  <Visualization {selected_country_details} on:close={handleClose} />
</main>

<style>
  #logo {
    position: absolute;
    left: 2px;
    top: 2px;
    height: 38px;
    z-index: 20;
  }

  @media only screen and (max-width: 768px) {
    #logo {
      height: 27px;
    }
  }

  #tracker_button {
    position: absolute;
    top: 3px;
    left: 5px;
    background-color: white;
    border: 1px solid rgb(173, 173, 173);
    color: black;
    padding: 5px 10px;
    text-align: center;
    text-decoration: none;
    border-radius: 2px;
    display: inline-block;
    font-size: 1em;
    cursor: pointer;
    z-index: 10;
    font-weight: 500;
    /* width: 70px; */
  }

  @media only screen and (max-width: 768px) {
    #tracker_button {
      font-size: 0.7em;
    }
  }

  @media only screen and (max-width: 500px) {
    #tracker_button {
      left: 1px;
      top: 1px;
      font-size: 0.7em;
      padding: 5px 5px;
    }
  }

  #tracker_button:hover {
    background-color: #aa4197;
    color: white;
  }

  main {
    width: 100vw;
    font-family: "Montserrat";
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #loading_screen {
    width: 100vw;
    position: absolute;
    background-color: #ffffff;
    z-index: 13;
    width: 100vw;
    display: flex;
    justify-content: center;
  }

  #loading_text {
    position: absolute;
    top: 40%;
    color: black;
  }

  #loading_button {
    position: absolute;
    top: 40%;
    font-family: "Montserrat";
    background-color: #ffffff;
    color: black;
    border: 1px solid gray;
    border-radius: 4px;
    padding: 10px 15px;
    font-size: 16px;
    cursor: pointer;
    transition:
      background-color 0.3s ease,
      color 0.3s ease;
    visibility: hidden;
  }

  #loading_button:hover {
    background-color: #aa4197;
    color: white;
  }

  h1 {
    border-radius: 2px;
    position: absolute;
    font-weight: 400;
    padding: 5px;
    top: -2px;
    font-size: 2em;
    margin: 0px;
    text-align: center;
    color: black;
    background: white;
    z-index: 1;
    transition: top 0.3s ease;
    box-shadow: 0 0 3px #5a5a5a;
  }

  @media only screen and (max-width: 1450px) {
    h1 {
      font-size: 1.8em;
    }
  }

  @media only screen and (max-width: 1200px) {
    h1 {
      font-size: 1.6em;
    }
  }

  @media only screen and (max-width: 768px) {
    h1 {
      font-size: 1.2em;
    }
  }

  #agt_legend {
    width: 200px;
    position: absolute;
    bottom: 35px;
    left: 5px;
    background-color: rgba(255, 255, 255, 0.932);
    border-radius: 2px;
  }

  @media only screen and (max-width: 768px) {
    #agt_legend {
      width: 123px;
    }
  }

  #legend {
    width: 205px;
    position: absolute;
    bottom: 35px;
    right: 5px;
    background-color: rgba(255, 255, 255, 0.932);
    border-radius: 2px;
  }

  @media only screen and (max-width: 768px) {
    #legend {
      width: 123px;
    }
  }

  #legend_rectangle {
    fill: url(#legend_gradient);
  }

  .stop_one {
    stop-color: #e3b5b5;
  }
  .stop_two {
    stop-color: #7e4949;
  }
  .stop_three {
    stop-color: #290a0a;
  }

  #update {
    position: absolute;
    border-radius: 2px;
    bottom: 4px;
    right: 5px;
    color: black;
    font-size: 11.5px;
    background-color: rgba(255, 255, 255, 0.932);
    padding: 5px;
  }

  @media only screen and (max-width: 768px) {
    #update {
      right: 5px;
      font-size: 7px;
      bottom: 8px;
    }
  }

  #info_button {
    position: absolute;
    top: 3px;
    right: 5px;
    background-color: white;
    border: 1px solid rgb(173, 173, 173);
    color: black;
    padding: 5px 20px;
    text-align: center;
    text-decoration: none;
    border-radius: 2px;
    display: inline-block;
    font-size: 1em;
    cursor: pointer;
    z-index: 10;
    width: 50px;
  }

  #info_button:hover {
    background-color: #aa4197;
    color: white;
  }

  @media only screen and (max-width: 768px) {
    #info_button {
      font-size: 0.7em;
    }
  }

  @media only screen and (max-width: 500px) {
    #info_button {
      right: 1px;
      top: 1px;
      padding: 5px 12px;
      font-size: 0.7em;
      width: 40px;
    }
  }

  h4 {
    color: black;
    text-align: center;
    margin: 2px;
    font-weight: 500;
    font-size: 0.9em;
  }

  @media only screen and (max-width: 768px) {
    h4 {
      font-size: 0.6em;
    }
  }

  @media only screen and (max-width: 768px) {
    svg {
      height: 50px;
    }
  }
</style>
