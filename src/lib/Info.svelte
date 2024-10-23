<script>
    import * as d3 from "d3";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    let info_width, info_height;
    let info = {
        info_section:
            '\n    This map displays where formal peace agreements have been signed in the last year, represented by the agreement icon and the levels of estimated conflict-related fatalities per country in the last 12 months represented by the colored country polygons. The darker the color of the country, the more estimated fatalities. Hover the icon or country for more information on the data shown, or click on a country for more data to be shown.\n    \n    The data driving this application are as follows:\n    <ul>\n        <li>Peace process and peace agreement data, from the <a href=\"https://pax.peaceagreements.org/\" target=\"_blank\">PA-X Peace Agreements Database</a> - Bell, C., & Badanjak, S. (2019). Introducing PA-X: A new peace agreement database and dataset. Journal of Peace Research, 56(3), 452-466. Available at\u202fhttps://pax.peaceagreements.org/, (V8).</li>\n        <li>Conflict estimated fatalities from last 12 months (polygons on map and monthly and annual stats), from the <a href=\"https://ucdp.uu.se/downloads/index.html#candidate\" target=\"_blank\">Uppsala Conflict Data Program (UCDP) Candidate Events dataset</a> (UCDP GED Candidate (August 2024)), for events that are in active conflicts passing UCDP 25 battle-related deaths threshold - Hegre, H\u00e5vard, Mihai Croicu, Kristine Eck, and Stina H\u00f6gbladh (July 2020) Introducing the UCDP Candidate Events Dataset. Research & Politics</li>\n        <li>Estimated fatalities from political violence events, from the <a href=\"https://acleddata.com/\" target=\"_blank\">Armed Conflict Location Event Data (ACLED)</a>, last updated on 13/09/2024 - Raleigh, C., Kishi, R. & Linke, A. Political instability patterns are obscured by conflict dataset scope conditions, sources, and coding choices. Humanit Soc Sci Commun 10, 74 (2023). https://doi.org/10.1057/s41599-023-01559-4.</li>\n        <li>Displacement data from <a href=\"https://data.humdata.org/dataset/idmc-internal-displacements-new-displacements-idps\" target=\"_blank\">Internal Displacement Monitoring Centre (IDMC)</a>, last updated on 11 June 2024</li>\n        <li>Food insecurity data from <a href=\"https://data.humdata.org/dataset/global-acute-food-insecurity-country-data\" target=\"_blank\">Integrated Food Insecurity Classification (IPC)</a>, last updated on 18 September 2024</li>\n        <li>Global Peace Index, from the <a href=\"https://www.visionofhumanity.org/maps/#/\" target=\"_blank\">Vision of Humanity</a>, last updated on 2022 - Global Peace Index: Institute for Economics & Peace. Global Peace Index 2022: Measuring Peace in a Complex World, Sydney, June 2022. Available from: http://visionofhumanity.org/resources.</li>\n        <li>Corruption Perception Index, from the <a href=\"https://www.transparency.org/en/cpi/2023\" target=\"_blank\">Transparency International</a>, last updated on 2023 - Corruption Perception Index (CPI) [2023] by Transparency International is licensed under CC-BYND 4.0. View here: https://www.transparency.org/en/cpi/2023.</li>\n        <li>INFORM Severity Index, from the <a href=\"https://www.acaps.org/en/thematics/all-topics/inform-severity-index\" target=\"_blank\">ACAPS</a>, last updated on 28/08/2024.</li>\n        <li>National Action Plan information taken from the <a href=\"https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/1156085/uk-women-peace-security-national-action-plan-2023-2027.pdf\" target=\"_blank\">UK Government WPS NAP</a> - UK Women, Peace and Security National Action Plan 2023-2027.</li>\n    </ul>\n  Credits: <p style="margin:0px">Data Preparation by Niamh Henry, University of Edinburgh</p> <p style="margin:0px">Visualization by Tomas Vancisin, University of Edinburgh</p>  '
    };

    function closeInformation() {
        dispatch("close");
    }
</script>

<div
    class="information"
    bind:clientWidth={info_width}
    bind:clientHeight={info_height}
>
    <div id="info_title">
        <button class="btn close" on:click={closeInformation}
            ><i class="fa fa-close"></i></button
        >
        <h3>About</h3>
    </div>
    <div id="info_content">{@html info.info_section}</div>
</div>

<style>
    .information {
        color: black;
        position: fixed;
        border-radius: 2px;
        right: 0px;
        width: 500px;
        height: calc(100%);
        transition: right 0.3s ease;
        background-color: rgba(247, 247, 247, 0.932);
        overflow: hidden;
        z-index: 5;
        font-family: "Montserrat", sans-serif;
        font-optical-sizing: auto;
        font-weight: 300;
        font-size: 0.9em;
        font-style: normal;
        display: flex;
        flex-direction: column;
        z-index: 11;
        box-shadow: 0 0 3px #000000;
    }

    @media (max-width: 1450px) {
        .information {
            width: 450px;
        }
    }

    @media (max-width: 1200px) {
        .information {
            width: 400px;
        }
    }

    @media (max-width: 768px) {
        .information {
            width: 100%;
            font-size: 0.8em;
        }
    }

    #info_title {
        text-align: center;
        justify-content: center;
        position: relative;
        border-radius: 5px;
    }

    h3 {
        color: rgb(0, 0, 0);
        margin: auto;
        font-size: 1.3em;
        padding: 8px;
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
    #info_content {
        padding: 10px;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        overflow-y: auto;
        font-size: 0.9em;
        margin: 5px;
        border-radius: 2px;
        gap: 6px;
        line-height: 1.5;
        font-weight: 400;
    }

    @media only screen and (max-width: 1450px) {
        #info_content {
            font-size: 0.8em;
        }
    }

    @media only screen and (max-width: 1200px) {
        #info_content {
            font-size: 0.8em;
        }
    }

    @media only screen and (max-width: 768px) {
        #info_content {
            font-size: 0.8em;
        }
    }

    .btn.close {
        position: absolute;
        right: 4px;
        background: none;
        color: black;
        border: none;
        padding: 2px 10px;
        border-radius: 2px;
        font-size: 1.5em;
        cursor: pointer;
        font-family: "Montserrat";
        transition: border 0.3s ease;
    }

    .btn.close:hover {
        color: red;
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
</style>
