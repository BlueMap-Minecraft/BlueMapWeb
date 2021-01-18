import {alert, dispatchEvent} from "../util/Utils";
import {FileLoader, Scene} from "three";
import {MarkerSet} from "./MarkerSet";
import {HTMLMarker} from "./HTMLMarker";

export class MarkerManager {

    constructor(markerFileUrl, mapId, events = null) {
        Object.defineProperty(this, 'isMarkerManager', {value: true});

        this.markerFileUrl = markerFileUrl;
        this.mapId = mapId;
        this.events = events;

        this.markerSets = {};

        this.objectMarkerScene = new Scene(); //3d markers
        this.elementMarkerScene = new Scene(); //html markers

        this._popupId = 0;
    }

    update() {
        return this.loadMarkersFile()
            .then(markersFile => {
                let prevMarkerSets = this.markerSets;
                this.markerSets = {};
                if (Array.isArray(markersFile.markerSets)){
                    for (let markerSetData of markersFile.markerSets){
                        let markerSetId = markerSetData.id;
                        if (!markerSetId) continue;
                        if (this.markerSets[markerSetId]) continue; // skip duplicate id's

                        this.markerSets[markerSetId] = prevMarkerSets[markerSetId];
                        delete prevMarkerSets[markerSetId];

                        this.updateMarkerSet(markerSetId, markerSetData);
                    }
                }

                //remaining (removed) markerSets
                for (let markerSetId in prevMarkerSets) {
                    if (!prevMarkerSets.hasOwnProperty(markerSetId)) continue;
                    if (!prevMarkerSets[markerSetId] || !prevMarkerSets[markerSetId].isMarkerSet) continue;


                    // keep marker-sets that were not loaded from the marker-file
                    if (prevMarkerSets[markerSetId]._source !== MarkerSet.Source.MARKER_FILE){
                        this.markerSets[markerSetId] = prevMarkerSets[markerSetId];
                        continue;
                    }

                    prevMarkerSets[markerSetId].dispose();
                }
            })
            .catch(reason => {
                alert(this.events, reason, "warning");
            });
    }

    updateMarkerSet(markerSetId, markerSetData) {
        if (!this.markerSets[markerSetId] || !this.markerSets[markerSetId].isMarkerSet){
            this.createMarkerSet(markerSetId);
            this.objectMarkerScene.add(this.markerSets[markerSetId]._objectMarkerObject);
            this.elementMarkerScene.add(this.markerSets[markerSetId]._elementMarkerObject);
        }

        this.markerSets[markerSetId].update(markerSetData);
    }

    createMarkerSet(id) {
        this.markerSets[id] = new MarkerSet(this, id, this.mapId, this.events);
        return this.markerSets[id];
    }

    dispose() {
        let sets = {...this.markerSets};
        for (let markerSetId in sets){
            if (!sets.hasOwnProperty(markerSetId)) continue;
            if (!sets[markerSetId] || !sets[markerSetId].isMarkerSet) continue;

            sets[markerSetId].dispose();
        }

        this.markerSets = {};
    }

    showPopup(html, x, y, z, autoRemove = true, onRemoval = null){
        let marker = new HTMLMarker(this, `popup-${this._popupId++}`, this.elementMarkerScene);
        marker.setPosition(x, y, z);
        marker.html = html;

        marker.onDisposal = onRemoval;

        dispatchEvent(this.events, 'bluemapPopupMarker', {marker: marker});

        if (autoRemove){
            let onRemove = () => {
                marker.blendOut(200, finished => {
                    if (finished) marker.dispose();
                });
            };

            this.events.addEventListener('bluemapPopupMarker', onRemove, {once: true});
            setTimeout(() => {
                this.events.addEventListener('bluemapCameraMoved', onRemove, {once: true});
            }, 1000);
        }

        marker.blendIn(200);
        return marker;
    }

    /**
     * Loads the markers.json file for this map
     * @returns {Promise<Object>}
     */
    loadMarkersFile() {
        return new Promise((resolve, reject) => {
            alert(this.events, `Loading markers from '${this.markerFileUrl}'...`, "fine");

            let loader = new FileLoader();
            loader.setResponseType("json");
            loader.load(this.markerFileUrl,
                markerFile => {
                    if (!markerFile) reject(`Failed to parse '${this.markerFileUrl}'!`);
                    else resolve(markerFile);
                },
                () => {},
                () => reject(`Failed to load '${this.markerFileUrl}'!`)
            )
        });
    }

}