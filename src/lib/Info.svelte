<script>
    import { createEventDispatcher } from "svelte";

    export let info;
    let info_width, info_height;
    const dispatch = createEventDispatcher();

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
