import {FileLoader, Scene} from "three";
import {MarkerSet} from "./MarkerSet";
import {ShapeMarker} from "./ShapeMarker";
import {alert} from "../util/Utils";
import {ExtrudeMarker} from "./ExtrudeMarker";
import {LineMarker} from "./LineMarker";
import {HtmlMarker} from "./HtmlMarker";
import {PoiMarker} from "./PoiMarker";

/**
 * A manager for loading and updating markers from a markers.json file
 */
export class MarkerFileManager {

    /**
     * @constructor
     * @param markerScene {Scene} - The scene to which all markers will be added
     * @param fileUrl {string} - The marker file from which this manager updates its markers
     * @param mapId {string} - The mapId of the map for which the markers should be loaded
     * @param events {EventTarget}
     */
    constructor(markerScene, fileUrl, mapId, events = null) {
        Object.defineProperty(this, 'isMarkerFileManager', {value: true});

        this.markerScene = markerScene;
        this.fileUrl = fileUrl;
        this.mapId = mapId;
        this.events = events;

        /** @type {Map<string, MarkerSet>} */
        this.markerSets = new Map();
        /** @type {Map<string, Marker>} */
        this.markers = new Map();

        /** @type {NodeJS.Timeout} */
        this._updateInterval = null;
    }

    /**
     * Sets the automatic-update frequency, setting this to 0 or negative disables automatic updates (default).
     * This is better than using setInterval() on update() because this will wait for the update to finish before requesting the next update.
     * @param ms - interval in milliseconds
     */
    setAutoUpdateInterval(ms) {
        if (this._updateInterval) clearInterval(this._updateInterval);
        if (ms > 0) {
            let autoUpdate = () => {
                this.update().finally(() => {
                    this._updateInterval = setTimeout(autoUpdate, ms);
                });
            };

            this._updateInterval = setTimeout(autoUpdate, ms);
        }
    }

    /**
     * Loads the marker-file and updates all managed markers.
     * @returns {Promise<object>} - A promise completing when the markers finished updating
     */
    update() {
        return this.loadMarkerFile()
            .then(markerFileData => this.updateFromData(markerFileData))
            .catch(error => {
                alert(this.events, error, "error");
            });
    }

    /**
     * Stops automatic-updates and disposes all markersets and markers managed by this manager
     */
    dispose() {
        this.setAutoUpdateInterval(0);
        this.markerSets.forEach(markerSet => markerSet.dispose());
    }

    /**
     * @private
     * Adds a MarkerSet to this Manager, removing any existing markerSet with this id first.
     * @param markerSet {MarkerSet}
     */
    addMarkerSet(markerSet) {
        this.removeMarkerSet(markerSet.markerSetId);

        this.markerSets.set(markerSet.markerSetId, markerSet);
        this.markerScene.add(markerSet)
    }

    /**
     * @private
     * Removes a MarkerSet from this Manager
     * @param setId {string} - The id of the MarkerSet
     */
    removeMarkerSet(setId) {
        let markerSet = this.markerSets.get(setId);

        if (markerSet) {
            this.markerScene.remove(markerSet);
            this.markerSets.delete(setId);
            markerSet.dispose();
        }
    }

    /**
     * @private
     * Adds a marker to this manager
     * @param markerSet {MarkerSet}
     * @param marker {Marker}
     */
    addMarker(markerSet, marker) {
        this.removeMarker(marker.markerId);

        this.markers.set(marker.markerId, marker);
        markerSet.add(marker);
    }

    /**
     * @private
     * Removes a marker from this manager
     * @param markerId {string}
     */
    removeMarker(markerId) {
        let marker = this.markers.get(markerId);

        if (marker) {
            if (marker.parent) marker.parent.remove(marker);
            this.markers.delete(markerId);
            marker.dispose();
        }
    }

    /**
     * @private
     * Updates all managed markers using the provided data.
     * @param markerData {object} - The data object, usually parsed json from a markers.json
     */
    updateFromData(markerData) {
        if (!Array.isArray(markerData.markerSets)) return;
        let updatedMarkerSets = new Set();

        // add & update
        markerData.markerSets.forEach(markerSetData => {
            try {
                let markerSet = this.updateMarkerSetFromData(markerSetData);
                updatedMarkerSets.add(markerSet);
            } catch (err) {
                alert(this.events, "Failed to parse markerset-data: " + err, "fine");
            }
        });

        // remove not updated MarkerSets
        this.markerSets.forEach((markerSet, setId) => {
            if (!updatedMarkerSets.has(markerSet)) {
                this.removeMarkerSet(setId);
            }
        });
    }

    /**
     * @private
     * Updates a managed MarkerSet using the provided data
     * @param markerSetData {object} - The data object for a MarkerSet, usually parsed json from a markers.json
     * @returns {MarkerSet} - The updated MarkerSet
     * @throws {Error} - On invalid / missing data
     */
    updateMarkerSetFromData(markerSetData) {
        if (!markerSetData.id) throw new Error("markerset-data has no id!");
        let markerSet = this.markerSets.get(markerSetData.id);

        // create new if not existent
        if (!markerSet) {
            markerSet = new MarkerSet(markerSetData.id);
            this.addMarkerSet(markerSet);
        }

        // update set info
        markerSet.label = markerSetData.label || markerSetData.id;
        markerSet.toggleable = !!markerSetData.toggleable;
        markerSet.defaultHide = !!markerSetData.defaultHide;

        // update markers
        let updatedMarkers = new Set();

        if (Array.isArray(markerSetData.marker)) {
            markerSetData.marker.forEach(markerData => {
                if (markerData.map && markerData.map !== this.mapId) return;

                try {
                    let marker = this.updateMarkerFromData(markerSet, markerData);
                    updatedMarkers.add(marker);
                } catch (err) {
                    alert(this.events, "Failed to parse marker-data: " + err, "fine");
                    console.debug(err);
                }
            });
        }

        // remove not updated Markers
        markerSet.children.forEach((marker) => {
            if (marker.isMarker && !updatedMarkers.has(marker) && !this.markers.has(marker.markerId)) {
                this.removeMarker(marker.markerId);
            }
        });

        return markerSet;
    }

    /**
     * @private
     * Updates a managed Marker using the provided data
     * @param markerSet {MarkerSet} - The MarkerSet this marker should be in
     * @param markerData {object}
     * @returns {Marker} - The updated Marker
     * @throws {Error} - On invalid / missing data
     */
    updateMarkerFromData(markerSet, markerData) {
        if (!markerData.id) throw new Error("marker-data has no id!");
        if (!markerData.type) throw new Error("marker-data has no type!");
        let marker = this.markers.get(markerData.id);

        // create new if not existent of wrong type
        if (!marker || marker.markerType !== markerData.type) {
            switch (markerData.type) {
                case "shape" : marker = new ShapeMarker(markerData.id); break;
                case "extrude" : marker = new ExtrudeMarker(markerData.id); break;
                case "line" : marker = new LineMarker(markerData.id); break;
                case "html" : marker = new HtmlMarker(markerData.id); break;
                case "poi" : marker = new PoiMarker(markerData.id); break;
                default : throw new Error(`Unknown marker-type: '${markerData.type}'`);
            }

            this.addMarker(markerSet, marker);
        }

        // make sure marker is in the correct MarkerSet
        if (marker.parent !== markerSet) markerSet.add(marker);

        // update marker
        marker.updateFromData(markerData);

        return marker;
    }

    /**
     * @private
     * Loads the marker file
     * @returns {Promise<Object>} - A promise completing with the parsed json object from the loaded file
     */
    loadMarkerFile() {
        return new Promise((resolve, reject) => {
            let loader = new FileLoader();
            loader.setResponseType("json");
            loader.load(this.fileUrl,
                markerFileData => {
                    if (!markerFileData) reject(`Failed to parse '${this.fileUrl}'!`);
                    else resolve(markerFileData);
                },
                () => {},
                () => reject(`Failed to load '${this.fileUrl}'!`)
            )
        });
    }

}