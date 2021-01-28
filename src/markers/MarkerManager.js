import {FileLoader, Scene} from "three";
import {MarkerSet} from "./MarkerSet";
import {alert} from "../util/Utils";

/**
 * A manager for loading and updating markers from a file
 */
export class MarkerManager {

    /**
     * @constructor
     * @param markerScene {Scene} - The scene to which all markers will be added
     * @param fileUrl {string} - The marker file from which this manager updates its markers
     * @param events {EventTarget}
     */
    constructor(markerScene, fileUrl, events = null) {
        Object.defineProperty(this, 'isMarkerManager', {value: true});

        this.markerScene = markerScene;
        this.fileUrl = fileUrl;
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
                alert(this.events, error, "warning");
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
     * Removes all markers managed by this marker-manager
     */
    clear() {
        this.markerSets.forEach(markerSet => this.removeMarkerSet(markerSet.markerSetId));
    }

    /**
     * @protected
     * Adds a MarkerSet to this Manager, removing any existing markerSet with this id first.
     * @param markerSet {MarkerSet}
     */
    addMarkerSet(markerSet) {
        this.removeMarkerSet(markerSet.markerSetId);

        this.markerSets.set(markerSet.markerSetId, markerSet);
        this.markerScene.add(markerSet)
    }

    /**
     * @protected
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
     * @protected
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
     * @protected
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
     * Updates all managed markers using the provided data.
     * @param markerData {object} - The data object, usually parsed json from a markers.json
     */
    updateFromData(markerData) {}

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