import axios from 'axios';
import EventBase from '~/sitings-sdk/src/events/EventBase';
import HouseData from '~/sitings-sdk/src/sitings/data/HouseData';

function processHouseSVGFormat(rawData) {
    /**
     * The HouseData object will parse the SVG file and will group all of the available facades, options and rooflines.
     * The parsed layers will contain all of the SVG elements read from the file.
     *
     * @type {HouseData}
     */
    let houseData = new HouseData(
        'ID',
        'Rise 4315',
        rawData
    );

    return new Promise(resolve => {
        houseData.addEventListener(EventBase.COMPLETE, e => {
            e.dispatcher.removeEventListener(EventBase.COMPLETE);
            resolve({houseData, rawData});
        });
        houseData.parse();
    });
}

// function houseDataParseComplete(e) {
//
//     console.log("----------------------------------------------");
//     console.log("Listing house details for " + houseData.name);
//
//     // List all of the facades in the house
//     console.log("----------------------------------------------");
//     for (let i = 0; i < houseData.facades.length; ++i) {
//         const facade = houseData.facades[i];
//         console.log(
//             "HouseData contains facade " + facade.id +
//             "; name=" + Utils.svgIdToName(facade.id)
//         );
//     }
//
//     // List all the options in the house
//     console.log("----------------------------------------------");
//     for (let i = 0; i < houseData.options.length; ++i) {
//         const option = houseData.options[i];
//         console.log(
//             "HouseData contains option " + option.id +
//             "; name=" + Utils.svgIdToName(option.id)
//         );
//     }
//
//     // List all the rooflines in the house; Each roofline is as associated to a single facade; whenever a facade
//     // is selected for display, the roofline is automatically shown as well.
//     console.log("----------------------------------------------");
//     for (let i = 0; i < houseData.roofs.length; ++i) {
//         const roof = houseData.roof[i];
//         console.log(
//             "HouseData contains roof " + roof.id +
//             "; name=" + Utils.svgIdToName(roof.id)
//         );
//     }
// }

export function loadSVGFromURL(houseSVG) {
    return new Promise((resolve, reject) => {
        try {
            axios.get(houseSVG)
                 .then(({data}) => processHouseSVGFormat(data))
                 .then(data => resolve(data));
        } catch (e) {
            reject(e);
        }
    });
}