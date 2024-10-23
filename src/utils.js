import * as d3 from "d3";

export async function getIndividualCSV(path) {
    let loadedData = await d3.csv(path);
    return loadedData;
}

export async function getCSV(paths) {
    const promises = paths.map(path => getIndividualCSV(path));
    const results = await Promise.all(promises);
    return results;
    // let loadedData = await d3.csv(path);
    // return loadedData
}

// export async function getGeo(url) {
//     let response = await fetch((import.meta.env.BASE_URL || "") + url);
//     let json = await response.json();
//     return json;
// }


export async function getGeo(url) {
    let response = await d3.json(url);
    // let json = await response.json();
    return response;
}