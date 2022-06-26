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
import {MarkerManager} from "./MarkerManager";
import {alert} from "../util/Utils";
import {MarkerSet} from "./MarkerSet";
import {PlayerMarker} from "./PlayerMarker";

export class PlayerMarkerManager extends MarkerManager {

    /**
     * @constructor
     * @param markerScene {THREE.Scene} - The scene to which all markers will be added
     * @param playerDataUrl {string} - The marker file from which this manager updates its markers
     * @param events {EventTarget}
     */
    constructor(markerScene, playerDataUrl, events = null) {
        super(markerScene, playerDataUrl, events);
        Object.defineProperty(this, 'isPlayerMarkerManager', {value: true});

        this.getPlayerMarkerSet();
    }

    /**
     * @param markerData {{players: PlayerLike[]}}
     */
    updateFromData(markerData) {

        if (!Array.isArray(markerData.players)) {
            this.clear();
            return false;
        }

        /** @type Set<Marker> */
        let updatedPlayerMarkers = new Set();

        // update
        markerData.players.forEach(playerData => {
            try {
                let playerMarker = this.updatePlayerMarkerFromData(playerData);
                updatedPlayerMarkers.add(playerMarker);
            } catch (err) {
                alert(this.events, err, "fine");
            }
        });

        // remove
        this.markers.forEach((playerMarker, markerId) => {
            if (!updatedPlayerMarkers.has(playerMarker)) {
                this.removeMarker(markerId);
            }
        });

        return true;
    }

    /**
     * @private
     * @param markerData {PlayerLike}
     * @returns PlayerMarker
     */
    updatePlayerMarkerFromData(markerData) {
        let playerUuid = markerData.uuid;
        if (!playerUuid) throw new Error("player-data has no uuid!");
        let markerId = "bm-player-" + playerUuid;

        /** @type PlayerMarker */
        let marker = this.markers.get(markerId);

        let markerSet = this.getPlayerMarkerSet();

        // create new if not existent of wrong type
        if (!marker || !marker.isPlayerMarker) {
            marker = new PlayerMarker(markerId, playerUuid);
            this.addMarker(markerSet, marker);
        }

        // make sure marker is in the correct MarkerSet
        if (marker.parent !== markerSet) markerSet.add(marker);

        // update
        marker.updateFromData(markerData);

        // hide if from different world
        marker.visible = !markerData.foreign;

        return marker;
    }

    /**
     * @private
     * @returns {MarkerSet}
     */
    getPlayerMarkerSet() {
        let playerMarkerSet = this.markerSets.get("bm-players");

        if (!playerMarkerSet) {
            playerMarkerSet = new MarkerSet("bm-players");
            playerMarkerSet.data.label = "Players";
            this.addMarkerSet(playerMarkerSet);
        }

        return playerMarkerSet;
    }

    /**
     * @param playerUuid {string}
     * @returns {Marker}
     */
    getPlayerMarker(playerUuid) {
        return this.markers.get("bm-player-" + playerUuid);
    }

}