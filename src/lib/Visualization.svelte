<script>
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";
    import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
    import * as d3 from "d3";
    import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";

    const dispatch = createEventDispatcher();

    //colors of the map: #1a1a1a (land) #263852 (water)

    export let selected_country_details;
    let details_width;
    let details_height;
    let overview_height;
    let vis_width = 100;

    $: gpi_scaling = d3
        .scaleLinear()
        .range([5, vis_width - 5])
        .domain([1, 163]);
    $: cpi_scaling = d3
        .scaleLinear()
        .range([5, vis_width - 5])
        .domain([1, 181]);

    let acled_month,
        acled_month_change,
        acled_year,
        acled_year_change,
        ucdp_month,
        ucdp_month_change,
        ucdp_year,
        ucdp_year_change,
        acled_update,
        ucdp_update,
        tracker_link,
        pax_link,
        gpi,
        cpi,
        number_of_agreements,
        rectSize = 5,
        vis_height,
        gap = 2;

    let x_y_rectangles = [];
    let agts;

    function calculateRectanglesPerRow() {
        return Math.floor((vis_width - 10 + gap) / (rectSize + gap));
    }

    // Generate rectangles arranged in rows with gaps
    function generateRectangles(rect) {
        x_y_rectangles = [];
        const rectsPerRow = calculateRectanglesPerRow();
        const totalRows = Math.ceil(rect / rectsPerRow);
        vis_height = totalRows * (rectSize + gap) - gap; // adjust height

        for (let i = 0; i < rect; i++) {
            const col = i % rectsPerRow; // column position
            const row = Math.floor(i / rectsPerRow); // row position

            const x = col * (rectSize + gap);
            const y = row * (rectSize + gap);

            x_y_rectangles.push({ x, y });
        }
    }

    $: if (selected_country_details) {
        acled_update = selected_country_details.acled_last_updated;
        ucdp_update = selected_country_details.ucdp_last_updated;

        //populate acled data
        acled_month = +selected_country_details.acled_fatalities_last_month;
        acled_month_change =
            +selected_country_details.acled_change_in_fatalities_last_month;
        acled_year = +selected_country_details.acled_fatalities_last_12;
        acled_year_change =
            +selected_country_details.acled_change_in_fatalities_last_12_months;

        gpi = +selected_country_details.gpi_rank_value;
        cpi = +selected_country_details.cpi_rank_value;

        //populate ucdp data
        ucdp_month = +selected_country_details.ucdp_fatalities_last_month;
        ucdp_month_change =
            +selected_country_details.ucdp_change_in_fatalities_last_month;
        ucdp_year = +selected_country_details.ucdp_fatalities_last_12;
        ucdp_year_change =
            +selected_country_details.ucdp_change_in_fatalities_last_12_months;

        //populate links to pax and tracker
        tracker_link = selected_country_details.tracker_url;
        if (tracker_link == "") {
            tracker_link = "https://pax.peaceagreements.org/tracker/all/";
        }
        pax_link = selected_country_details.search_pax;

        //agreements
        agts = selected_country_details.total_agreements;
    }

    $: generateRectangles(agts);
    $: if (vis_width || agts) {
        generateRectangles(agts);
    }

    function closeVisualization() {
        dispatch("close");
    }

    let tracker_width;
    function show_database_tooltip(text, event) {
        const tooltip = document.getElementById("tracker_link");
        const rect = tooltip.getBoundingClientRect();
        tracker_width = rect.width;

        d3.select("#database_tooltip")
            .text(text)
            .style("bottom", "5px")
            .style("visibility", "visible");

        if (text == "PA-X Tracker") {
            d3.select("#database_tooltip").style("left", "0px");
        } else {
            d3.select("#database_tooltip").style(
                "left",
                tracker_width + 10 + "px",
            );
        }
    }
    function hide_database_tooltip() {
        d3.select("#database_tooltip").style("visibility", "hidden");
    }

    let rowHeight;
    let rowWidth;
    function show_fatalities_tooltip(text, event) {
        const rowElement = event.currentTarget;
        const rect = rowElement.getBoundingClientRect();
        rowHeight = rect.height;
        rowWidth = rect.width;

        if (text == "acled_month") {
            d3.select("#month_tooltip")
                .style("visibility", "visible")
                .style("top", rowHeight + "px")
                .style("left", "5px")
                .html(
                    "Change from last month. <br> Last Updated: " +
                        acled_update,
                );
        } else if (text == "ucdp_month") {
            d3.select("#month_tooltip")
                .style("left", "5px")
                .style("top", rowHeight * 2 + "px")
                .html(
                    "Change from last month. <br> Last Updated: " + ucdp_update,
                )
                .style("visibility", "visible");
        } else if (text == "acled_year") {
            d3.select("#month_tooltip")
                .style("top", rowHeight + "px")
                .style("left", rowWidth + "px")
                .html(
                    "Change from last year. <br> Last Updated: " +
                        acled_update,
                )
                .style("visibility", "visible");
        } else {
            d3.select("#month_tooltip")
                .style("top", rowHeight * 2 + "px")
                .style("left", rowWidth + "px")
                .html(
                    "Change from last year. <br> Last Updated: " + ucdp_update,
                )
                .style("visibility", "visible");
        }
    }

    function hide_fatalities_tooltip () {
        d3.select("#month_tooltip").style("visibility", "hidden");
    }
</script>

<div
    class="visualization"
    bind:clientWidth={details_width}
    bind:clientHeight={details_height}
>
    <div id="peace_title_div">
        <button class="btn close" on:click={closeVisualization}
            ><i class="fa fa-close"></i></button
        >
        {#if selected_country_details}
            <h3>{selected_country_details.name}</h3>
        {/if}
    </div>

    <div id="peace_content">
        <div id="overview" bind:clientHeight={overview_height}>
            <h5>Overview</h5>
            <div class="content-wrapper">
                <div id="month_tooltip"></div>
                <div class="content-box">
                    <h6>Fatalities Last Month</h6>
                    <div
                        class="row"
                        on:mousemove={(event) =>
                            show_fatalities_tooltip("acled_month", event)}
                        on:mouseleave={hide_fatalities_tooltip}
                        role="alert"
                    >
                        <div id="acled_month">ACLED: {acled_month}</div>
                        <div id="acled_m_change">
                            {#if acled_month_change > 0}
                                <FontAwesomeIcon icon={faArrowUp} />
                            {:else if acled_month_change < 0}
                                <FontAwesomeIcon icon={faArrowDown} />
                            {/if}
                            {acled_month_change}
                        </div>
                    </div>
                    <div
                        class="row"
                        on:mousemove={(event) =>
                            show_fatalities_tooltip("ucdp_month", event)}
                        on:mouseleave={hide_fatalities_tooltip}
                        role="alert"
                    >
                        <div id="ucdp_month">UCDP: {ucdp_month}</div>
                        <div id="ucdp_m_change">
                            {#if ucdp_month_change > 0}
                                <FontAwesomeIcon icon={faArrowUp} />
                            {:else if ucdp_month_change < 0}
                                <FontAwesomeIcon icon={faArrowDown} />
                            {/if}
                            {ucdp_month_change}
                        </div>
                    </div>
                </div>
                <div class="content-box">
                    <h6>Fatalities Last Year</h6>
                    <div
                        class="row"
                        on:mousemove={(event) =>
                            show_fatalities_tooltip("acled_year", event)}
                        on:mouseleave={hide_fatalities_tooltip}
                        role="alert"
                    >
                        <div id="acled_year">ACLED: {acled_year}</div>
                        <div id="acled_y_change" class="tooltip-container">
                            {#if acled_year_change > 0}
                                <FontAwesomeIcon icon={faArrowUp} />
                            {:else if acled_year_change < 0}
                                <FontAwesomeIcon icon={faArrowDown} />
                            {/if}
                            {acled_year_change}
                        </div>
                    </div>
                    <div
                        class="row"
                        on:mousemove={(event) =>
                            show_fatalities_tooltip("ucdp_year", event)}
                        on:mouseleave={hide_fatalities_tooltip}
                        role="alert"
                    >
                        <div id="ucdp_year">UCDP: {ucdp_year}</div>
                        <div id="ucdp_y_change" class="tooltip-container">
                            {#if ucdp_year_change > 0}
                                <FontAwesomeIcon icon={faArrowUp} />
                            {:else if ucdp_year_change < 0}
                                <FontAwesomeIcon icon={faArrowDown} />
                            {/if}
                            {ucdp_year_change}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="peace_process">
            <h5>Peace Process</h5>
            <div class="scrollable-content">
                <p
                    style="margin-bottom: 10px; text-align: center; font-weight: 400"
                >
                    {agts} Peace Agreements:
                </p>
                <svg height="25px" width={vis_width - 5}>
                    {#each x_y_rectangles as rect (rect.x + "-" + rect.y)}
                        <rect
                            x={rect.x}
                            y={rect.y}
                            width={rectSize}
                            height={rectSize}
                            fill="black"
                        />
                    {/each}
                </svg>
                <br>
                {@html selected_country_details?.peace_process_text}
            </div>
        </div>

        <div id="general">
            <h5>General</h5>
            <div class="scrollable-content">
                <p
                    style="margin-bottom: 0px; margin-top: 5px; text-align: center; font-weight: 400"
                >
                    Global Peace Index Ranking:
                </p>
                <div id="gpi" bind:clientWidth={vis_width}>
                    <svg height="45px" width={vis_width}>
                        <defs>
                            <linearGradient id="Gradient1">
                                <stop class="stop1" offset="0%" />
                                <stop class="stop2" offset="50%" />
                                <stop class="stop3" offset="100%" />
                            </linearGradient>
                        </defs>
                        <rect
                            id="rect1"
                            x="5"
                            y="0"
                            rx="2"
                            width={vis_width - 5}
                            height="30"
                        />
                        <line
                            x1={gpi_scaling(gpi)}
                            y1="0"
                            x2={gpi_scaling(gpi)}
                            y2="30"
                            stroke="white"
                            stroke-width="1"
                        />
                        <text
                            x={gpi_scaling(gpi) - 5}
                            y="20"
                            paint-order="stroke"
                            stroke="black"
                            fill="white"
                            stroke-linecap="butt"
                            stroke-linejoin="miter"
                            text-anchor="end">{gpi}</text
                        >
                        <text
                            x="5"
                            y="40"
                            fill="black"
                            font-size="10"
                            font-weight="500"
                            text-anchor="start">more peaceful</text
                        >
                        <text
                            x={vis_width}
                            y="40"
                            fill="black"
                            font-size="10"
                            font-weight="500"
                            text-anchor="end">less peaceful</text
                        >
                    </svg>
                </div>

                <p
                    style="margin-bottom: 0px; margin-top: 15px; text-align: center; font-weight: 400"
                >
                    Corruption Perception Index Ranking:
                </p>
                <div id="cpi">
                    <svg height="45px" width={vis_width}>
                        <defs>
                            <linearGradient id="Gradient2">
                                <stop class="stop11" offset="0%" />
                                <stop class="stop22" offset="50%" />
                                <stop class="stop33" offset="100%" />
                            </linearGradient>
                        </defs>
                        <rect
                            id="rect2"
                            x="5"
                            rx="2"
                            y="0"
                            width={vis_width - 5}
                            height="30"
                        />
                        <line
                            x1={cpi_scaling(cpi)}
                            y1="0"
                            x2={cpi_scaling(cpi)}
                            y2="30"
                            stroke="white"
                            stroke-width="1"
                        />
                        <text
                            x={cpi_scaling(cpi) - 5}
                            y="20"
                            paint-order="stroke"
                            stroke="black"
                            fill="white"
                            stroke-linecap="butt"
                            stroke-linejoin="miter"
                            text-anchor="end">{cpi}</text
                        >
                        <text
                            x="5"
                            y="40"
                            fill="black"
                            font-size="10"
                            font-weight="500"
                            text-anchor="start">less corrupt</text
                        >
                        <text
                            x={vis_width}
                            y="40"
                            fill="black"
                            font-size="10"
                            font-weight="500"
                            text-anchor="end">more corrupt</text
                        >
                    </svg>
                </div>

                <br />

                {@html selected_country_details?.sm_general_updates}
            </div>
        </div>

        <div id="tracker">
            <h5>PA-X Tracker & Database</h5>
            <div id="database_tooltip">tooltip</div>
            <div class="content-wrapper">
                <div class="content-box-buttons">
                    <div id="tracker_link">
                        <a
                            href={tracker_link}
                            target="_blank"
                            on:mousemove={(event) =>
                                show_database_tooltip("PA-X Tracker", event)}
                            on:mouseleave={hide_database_tooltip}
                        >
                            <img src="./pax.png" alt="pax logo" />
                        </a>
                    </div>
                </div>
                <div class="content-box-buttons">
                    <div id="pax_link">
                        <a
                            href={pax_link}
                            target="_blank"
                            on:mousemove={(event) =>
                                show_database_tooltip("PA-X Database", event)}
                            on:mouseleave={hide_database_tooltip}
                        >
                            <img src="./search.png" alt="search icon" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    :root {
        color-scheme: dark;
    }

    .visualization {
        color: black;
        position: fixed;
        right: -100%;
        width: 500px;
        height: calc(100%);
        transition: right 0.4s ease;
        background-color: rgb(66 66 66 / 93%);
        overflow: hidden;
        z-index: 5;
        font-family: "Montserrat", sans-serif;
        font-optical-sizing: auto;
        font-weight: 300;
        font-style: normal;
        display: flex;
        flex-direction: column;
        z-index: 11;
        box-shadow: 0 0 3px #000000;
    }

    @media (max-width: 1450px) {
        .visualization {
            width: 450px;
        }
    }

    @media (max-width: 1200px) {
        .visualization {
            width: 400px;
        }
    }

    @media (max-height: 800px) {
        .visualization {
            width: 400px;
        }
    }

    @media (max-width: 768px) {
        .visualization {
            width: 100%;
        }
    }

    h3 {
        color: rgb(255, 255, 255);
        margin: auto;
        font-size: 1.3em;
        padding: 5px;
        font-weight: 450;
    }

    @media only screen and (max-width: 1450px) {
        h3 {
            font-size: 1.1em;
        }
    }

    @media only screen and (max-width: 1200px) {
        h3 {
            font-size: 1em;
        }
    }

    @media only screen and (max-width: 768px) {
        h3 {
            font-size: 0.9em;
        }
    }

    .btn.close {
        position: absolute;
        right: 4px;
        background: none;
        color: #fdd900;
        border: none;
        padding: 2px 10px;
        border-radius: 2px;
        font-size: 1.5em;
        cursor: pointer;
        font-family: "Montserrat";
        transition: border 0.3s ease;
    }

    .btn.close:hover {
        color: black;
    }

    @media only screen and (max-width: 1450px) {
        .btn.close {
            font-size: 1.3em;
        }
    }

    @media only screen and (max-width: 1024px) {
        .btn.close {
            font-size: 1.2em;
        }
    }

    #peace_content {
        height: 100%;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        overflow-y: auto;
        font-size: 0.8em;
        margin-top: 0px;
        margin-right: 4px;
        margin-left: 4px;
        margin-bottom: 4px;
        border-radius: 2px;
        gap: 5px;
    }

    @media only screen and (max-width: 1450px) {
        #peace_content {
            font-size: 0.8em;
        }
    }

    @media only screen and (max-width: 1200px) {
        #peace_content {
            font-size: 0.8em;
        }
    }

    @media only screen and (max-width: 768px) {
        #peace_content {
            font-size: 0.7em;
        }
    }

    #pax_link img,
    #tracker_link img {
        height: auto; /* Maintain the aspect ratio */
        max-height: 100%;
        object-fit: contain; /* Ensure the image scales properly without distortion */
    }

    /* Adjusting the flexbox container to be responsive */
    #pax_link,
    #tracker_link {
        text-align: center;
        height: 100%;
        cursor: pointer;
        border-radius: 2px;
    }

    .content-box-buttons {
        flex-basis: 50%;
        border-radius: 4px;
        background: rgb(255, 255, 255);
        color: black;
        padding: 2px;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        overflow: visible;
        box-shadow: 0 2px 3px rgba(107, 107, 107, 0.8);
    }

    .content-box-buttons:hover {
        background: #bd5453;
    }

    #general,
    #tracker,
    #peace_process {
        flex-basis: 0;
        width: 100%;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        line-height: 1.5;
    }

    #tracker_link a,
    #pax_link a {
        display: block; /* Make <a> element block level */
        width: 100%; /* Take full width */
        height: 100%; /* Take full height */
    }

    #tracker_link img,
    #pax_link img {
        max-height: 100%; /* Image will not exceed the parent container's height */
        width: auto; /* Maintain aspect ratio */
        object-fit: contain; /* Ensure the image fits well without distortion */
    }

    #overview {
        flex-basis: 0;
        width: 100%;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
    }

    #general,
    #tracker,
    #peace_process,
    #overview {
        background: white;
        border-radius: 2px;
    }

    #overview h5,
    #general h5,
    #tracker h5,
    #peace_process h5 {
        background-color: #d9d9d9;
        z-index: 2;
        box-shadow: 0 2px 3px rgba(117, 117, 117, 0.8);
    }

    #overview,
    #general,
    #tracker,
    #peace_process {
        flex-shrink: 0; /* Prevent shrinking of these elements */
    }

    #overview {
        flex-grow: 1; /* Takes one unit of the available space */
    }

    #tracker {
        flex-grow: 0.8; /* Takes one unit of the available space */
    }

    #general,
    #peace_process {
        flex-grow: 3; /* Takes three units of the available space each */
    }

    h5 {
        position: sticky;
        top: 0;
        z-index: 1;
        margin: 0;
        padding: 5px 15px;
        color: black;
        font-size: 1em;
        font-weight: 450;
    }

    @media only screen and (max-width: 768px) {
        h5 {
            font-size: 0.9em;
            padding: 3px 10px;
        }
    }

    h6 {
        position: sticky;
        text-align: center;
        top: 0;
        z-index: 1;
        margin: 0;
        padding: 2px 15px;
        color: black;
        font-size: 0.9em;
        font-weight: 450;
    }

    @media only screen and (max-width: 768px) {
        h6 {
            font-size: 0.8em;
            padding: 2px 10px;
        }
    }

    .content-wrapper {
        flex-grow: 1;
        display: flex;
        gap: 5px;
        padding: 5px;
        overflow-y: auto;
        flex-direction: row;
        align-items: stretch;
    }

    .content-box {
        flex-basis: 50%;
        background: white;
        color: black;
        padding: 2px;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        overflow: visible;
    }

    /* Add this CSS to the existing style */
    .row {
        display: flex;
        flex-grow: 1;
        justify-content: space-between;
        align-items: center;
        font-weight: 450;
        /* gap: 10px; */
    }

    .row > div {
        flex-basis: 50%;
        text-align: center;
    }

    .tooltip-container {
        position: relative;
        display: inline-block;
    }

    .tooltip-container .tooltip-text {
        visibility: hidden;
        width: 135px;
        background-color: black;
        color: #fff;
        text-align: center;
        border-radius: 3px;
        padding: 5px;
        position: absolute;
        z-index: 10;
        bottom: 0%;
        right: 5%;
        transform: translateX(-50%);
        opacity: 0;
        transition: opacity 0.3s;
        font-size: 0.8em;
    }

    @media only screen and (max-width: 1450px) {
        .tooltip-container .tooltip-text {
            right: -2%;
        }
    }

    @media only screen and (max-width: 1200px) {
        .tooltip-container .tooltip-text {
            right: -30%;
        }
    }

    @media only screen and (max-width: 768px) {
        .tooltip-container .tooltip-text {
            right: 15%;
        }
    }

    @media only screen and (max-width: 500px) {
        .tooltip-container .tooltip-text {
            right: 1%;
        }
    }

    @media only screen and (max-width: 400px) {
        .tooltip-container .tooltip-text {
            right: -20%;
        }
    }

    .tooltip-container .tooltip-text::after {
        content: "";
    }

    .tooltip-container:hover .tooltip-text {
        visibility: visible;
        opacity: 1;
    }

    #acled_month,
    #acled_year,
    #ucdp_month,
    #ucdp_year {
        flex-grow: 1; /* Allow these elements to take up the remaining space */
        display: flex;
        align-items: center;
        justify-content: center; /* Center text if desired */
        overflow: hidden;
    }

    @media only screen and (max-width: 768px) {
        #acled_month,
        #acled_m_change,
        #acled_year,
        #acled_y_change,
        #ucdp_month,
        #ucdp_m_change,
        #ucdp_year,
        #ucdp_y_change {
            font-size: 0.8em;
        }
    }

    #gpi,
    #cpi {
        width: 100%;
        height: 30px;
    }

    #cpi {
        margin-bottom: 10px;
    }

    .scrollable-content {
        flex-grow: 1;
        overflow-y: auto;
        padding: 2px 15px;
        background: none;
        box-sizing: border-box;
    }

    #peace_title_div {
        text-align: center;
        position: relative;
        margin: 2px;
    }

    :global(a) {
        color: rgb(110, 122, 177);
        cursor: pointer;
    }

    :global(ul) {
        padding-left: 20px;
        padding-right: 10px;
        margin: 0px;
        font-weight: 400;
    }

    #rect1 {
        fill: url(#Gradient1);
    }

    .stop1 {
        stop-color: gray;
    }
    .stop2 {
        stop-color: rgb(59, 59, 59);
    }
    .stop3 {
        stop-color: black;
    }

    #rect2 {
        fill: url(#Gradient2);
    }

    .stop11 {
        stop-color: gray;
    }
    .stop22 {
        stop-color: rgb(59, 59, 59);
    }
    .stop33 {
        stop-color: black;
    }

    #database_tooltip {
        padding: 5px;
        font-size: 10px;
        border-radius: 3px;
        visibility: hidden;
        position: absolute;
        background-color: black;
        color: white;
        z-index: 5;
        pointer-events: none;
    }

    #month_tooltip {
        padding: 5px;
        font-size: 10px;
        border-radius: 3px;
        visibility: hidden;
        position: absolute;
        background-color: black;
        color: white;
        z-index: 5;
        pointer-events: none;
    }
</style>
