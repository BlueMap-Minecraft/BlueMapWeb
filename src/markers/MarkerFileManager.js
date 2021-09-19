/*
 * This file is part of BlueMap, licensed under the MIT License (MIT).
 *
 * Copyright (c) Blue (Lukas Rieger) <https://bluecolored.de>
 * Copyright (c) contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
import {Scene} from "three";
import {MarkerSet} from "./MarkerSet";
import {ShapeMarker} from "./ShapeMarker";
import {alert} from "../util/Utils";
import {ExtrudeMarker} from "./ExtrudeMarker";
import {LineMarker} from "./LineMarker";
import {HtmlMarker} from "./HtmlMarker";
import {PoiMarker} from "./PoiMarker";
import {MarkerManager} from "./MarkerManager";

/**
 * A manager for loading and updating markers from a markers.json file
 */
export class MarkerFileManager extends MarkerManager {

    /**
     * @constructor
     * @param markerScene {Scene} - The scene to which all markers will be added
     * @param fileUrl {string} - The marker file from which this manager updates its markers
     * @param mapId {string} - The mapId of the map for which the markers should be loaded
     * @param events {EventTarget}
     */
    constructor(markerScene, fileUrl, mapId, events = null) {
        super(markerScene, fileUrl, events);
        Object.defineProperty(this, 'isMarkerFileManager', {value: true});

        this.mapId = mapId;
    }

    updateFromData(markerData) {
        if (!Array.isArray(markerData.markerSets)) return false;
        let updatedMarkerSets = new Set();

        // add & update
        markerData.markerSets.forEach(markerSetData => {
            try {
                let markerSet = this.updateMarkerSetFromData(markerSetData);
                updatedMarkerSets.add(markerSet);
            } catch (err) {
                alert(this.events, err, "fine");
            }
        });

        // remove not updated MarkerSets
        this.markerSets.forEach((markerSet, setId) => {
            if (!updatedMarkerSets.has(markerSet)) {
                this.removeMarkerSet(setId);
            }
        });

        return true;
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

            if (markerSetData.defaultHide) {
                markerSet.visible = false;
            }
        }

        // update set info
        markerSet.data.label = markerSetData.label || markerSetData.id;
        markerSet.data.toggleable = !!markerSetData.toggleable;
        markerSet.data.defaultHide = !!markerSetData.defaultHide;

        // update markers
        let updatedMarkers = new Set();

        if (Array.isArray(markerSetData.marker)) {
            markerSetData.marker.forEach(markerData => {
                if (markerData.map && markerData.map !== this.mapId) return;

                try {
                    let marker = this.updateMarkerFromData(markerSet, markerData);
                    updatedMarkers.add(marker);
                } catch (err) {
                    alert(this.events, err, "fine");
                    console.debug(err);
                }
            });
        }

        // remove not updated Markers
        markerSet.children.forEach((marker) => {
            if (marker.isMarker && !updatedMarkers.has(marker)) {
                this.removeMarker(marker.data.id);
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
        if (!marker || marker.data.type !== markerData.type) {
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

}