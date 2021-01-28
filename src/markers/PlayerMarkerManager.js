import {MarkerManager} from "./MarkerManager";
import {alert} from "../util/Utils";
import {MarkerSet} from "./MarkerSet";
import {PlayerMarker} from "./PlayerMarker";

export class PlayerMarkerManager extends MarkerManager {

    /**
     * @constructor
     * @param markerScene {THREE.Scene} - The scene to which all markers will be added
     * @param playerDataUrl {string} - The marker file from which this manager updates its markers
     * @param worldId {string} - The worldId of the world for which the markers should be loaded
     * @param events {EventTarget}
     */
    constructor(markerScene, playerDataUrl, worldId, events = null) {
        super(markerScene, playerDataUrl, events);
        Object.defineProperty(this, 'isPlayerMarkerManager', {value: true});

        this.worldId = worldId;

        this.getPlayerMarkerSet();
    }

    /**
     * @param markerData {{players: PlayerLike[]}}
     */
    updateFromData(markerData) {

        /** @type Set<Marker> */
        let updatedPlayerMarkers = new Set();

        // update
        if (Array.isArray(markerData.players)) {
            markerData.players.forEach(playerData => {
                try {
                    let playerMarker = this.updatePlayerMarkerFromData(playerData);
                    updatedPlayerMarkers.add(playerMarker);
                } catch (err) {
                    alert(this.events, err, "fine");
                }
            });
        }

        // remove
        this.markers.forEach((playerMarker, markerId) => {
            if (!updatedPlayerMarkers.has(playerMarker)) {
                this.removeMarker(markerId);
            }
        });

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

        // hide if wrong world
        marker.visible = markerData.world === this.worldId;

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
            this.addMarkerSet(playerMarkerSet);
        }

        return playerMarkerSet;
    }

}