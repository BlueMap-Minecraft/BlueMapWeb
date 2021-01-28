import {FileLoader, Object3D} from "three";
import {Map} from "./map/Map";

export { MapViewer } from "./MapViewer";
export * from "./util/Utils";
export { MarkerFileManager } from "./markers/MarkerFileManager";
export { PlayerMarkerManager } from "./markers/PlayerMarkerManager";

/**
 * Loads and returns a promise with an array of Maps loaded from that root-path.<br>
 * <b>DONT FORGET TO dispose() ALL MAPS RETURNED BY THIS METHOD IF YOU DONT NEED THEM ANYMORE!</b>
 * @param dataUrl {string}
 * @param events {EventTarget}
 * @returns {Promise<Map[]>}
 */
export const loadMaps = (dataUrl, events = null) => {

    function loadSettings() {
        return new Promise((resolve, reject) => {
            let loader = new FileLoader();
            loader.setResponseType("json");
            loader.load(dataUrl + "settings.json",
                resolve,
                () => {},
                () => reject("Failed to load the settings.json!")
            );
        });
    }

    return loadSettings().then(settings => {
        let maps = [];

        // create maps
        if (settings.maps !== undefined){
            for (let mapId in settings.maps) {
                if (!settings.maps.hasOwnProperty(mapId)) continue;

                let mapSettings = settings.maps[mapId];
                if (mapSettings.enabled)
                    maps.push(new Map(mapId, dataUrl + mapId + "/", events));
            }
        }

        // sort maps
        maps.sort((map1, map2) => {
            let sort = settings.maps[map1.id].ordinal - settings.maps[map2.id].ordinal;
            if (isNaN(sort)) return 0;
            return sort;
        });

        return maps;
    });

}

/**
 * @param event {object}
 * @return {boolean} - whether the event has been consumed (true) or not (false)
 */
Object3D.prototype.onClick = function(event) {

    if (this.parent){
        if (!Array.isArray(event.eventStack)) event.eventStack = [];
        event.eventStack.push(this);

        return this.parent.onClick(event);
    }

    return false;
};
