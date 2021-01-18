import {alert} from "../util/Utils";
import {FileLoader} from "three";

export class PlayerMarkerManager {

    constructor(mapViewer, events = null, livePlayerUrl = "/live/players") {
        this.mapViewer = mapViewer;
        this.events = events ? events : mapViewer.events;
        this.playerUrl = livePlayerUrl;

        this._playerData = {players:[]};

        this.events.addEventListener("bluemapMapChanged", this.onMapChange);
    }

    update(){
        return this.loadPlayerData()
            .then(playerData => {
                if (playerData && Array.isArray(playerData.players)) {
                    this._playerData = playerData;
                    this.updateMarkers();
                }
            })
            .catch(reason => {
                alert(this.events, reason, "warning");
            });
    }

    updateMarkers() {
        if (!this.mapViewer.map || !this.mapViewer.map.isLoaded) return;
        let markerset = this.getMarkerset();

        // map of uuid to playerdata
        let playerMap = {};
        this._playerData.players.forEach(player => {
            if (!player.uuid) return;

            // fill defaults
            player = {
                name: player.uuid,
                world: "",
                position: {},
                rotation: {},
                ...player
            };

            player.position = {
                x: 0,
                y: 0,
                z: 0,
                ...player.position
            };

            player.rotation = {
                yaw: 0,
                pitch: 0,
                roll: 0,
                ...player.rotation
            };

            playerMap[player.uuid] = player;
        });

        //update existing markers
        markerset.marker.forEach(marker => {
            if (!marker.isPlayerMarker) return;
            if (!playerMap[marker.playerUuid]) return;
            let player = playerMap[marker.playerUuid];


        });
    }

    getMarkerset() {
        //init markerset
        let markerset = this.mapViewer.map.markerManager.markerSets["bm-live-players"];
        if (!markerset || !markerset.isMarkerSet){
            markerset = this.mapViewer.map.markerManager.createMarkerSet("bm-live-players");
        }

        return markerset;
    }

    onMapChange = () => {
        this.updateMarkers();
    }

    dispose() {
        this.events.removeEventListener("bluemapMapChanged", this.onMapChange);

        this._playerData = {players:[]};
        this.updateMarkers();
    }

    /**
     * Loads the playerdata
     * @returns {Promise<Object>}
     */
    loadPlayerData() {
        return new Promise((resolve, reject) => {
            //alert(this.events, `Loading players from '${this.playerUrl}'...`, "fine");

            let loader = new FileLoader();
            loader.setResponseType("json");
            loader.load(this.playerUrl,
                playerData => {
                    if (!playerData) reject(`Failed to parse '${this.playerUrl}'!`);
                    else resolve(playerData);
                },
                () => {},
                () => reject(`Failed to load '${this.playerUrl}'!`)
            )
        });
    }

}