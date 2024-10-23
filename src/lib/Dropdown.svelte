<script>
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();
    export let country_dropdown;
    let selectedCountry = "";

    function handleSelection(country) {
        dispatch("close", country);
    }
</script>

<div class="dropdown">
    <button class="dropbtn" title="Choose country">
        <i class="fa fa-map-marker"></i>
    </button>
    <div class="dropdown-content">
        {#each country_dropdown as country}
            <a href="#" on:click={() => handleSelection([country.name,country.iso_code])}>{country.name}</a>
        {/each}
    </div>
</div>

<style>
    /* Container needed to position the dropdown content */
    .dropdown {
        position: absolute;
        top: 67px;
        right: 5px;
        display: inline-block;
        z-index: 10;
        font-family: "Montserrat";
    }

    @media only screen and (max-width: 500px) {
        .dropdown {
            top: 53px;
            right: 1px;
        }
    }

    .dropbtn {
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

    .dropbtn:hover {
        background-color: #aa4197;
        color: white;
    }

    @media only screen and (max-width: 768px) {
        .dropbtn {
            font-size: 0.7em;
        }
    }

    @media only screen and (max-width: 500px) {
        .dropbtn {
            padding: 4px 10px;
            font-size: 0.7em;
            width: 40px;
        }
    }
    /* Dropdown content (hidden by default) */
    .dropdown-content {
        display: none;
        position: absolute;
        top: 30px;
        background-color: #f9f9f9;
        min-width: 200px;
        right: 0px;
        box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
        z-index: 1;
        max-height: 350px;
        overflow-y: auto;
    }

    /* Links inside the dropdown */
    .dropdown-content a {
        color: black;
        padding: 10px 16px;
        text-decoration: none;
        display: block;
    }

    @media only screen and (max-width: 500px) {
        .dropdown-content {
            top: 22px;
        }
    }

    /* Change color of dropdown links on hover */
    .dropdown-content a:hover {
        background-color: #f1f1f1;
    }

    /* Show the dropdown menu on hover */
    .dropdown:hover .dropdown-content {
        display: block;
    }

    .dropdown:hover .dropbtn {
        background-color: #aa4197;
        color: white;
    }
</style>
