import {ShapeMarker} from "./ShapeMarker";
import {Object3D} from "three";
import {LineMarker} from "./LineMarker";
import {ExtrudeMarker} from "./ExtrudeMarker";
import {HTMLMarker} from "./HTMLMarker";
import {POIMarker} from "./POIMarker";
import {Marker} from "./Marker";
import {PlayerMarker} from "./PlayerMarker";

export class MarkerSet {

    static Source = {
        CUSTOM: 0,
        MARKER_FILE: 1
    }

    constructor(manager, id, mapId, events = null) {
        Object.defineProperty(this, 'isMarkerSet', {value: true});

        this.manager = manager;
        this.id = id;

        this._mapId = mapId;
        this._objectMarkerObject = new Object3D();
        this._elementMarkerObject = new Object3D();
        this.events = events;

        this.label = this.id;
        this.toggleable = true;
        this.defaultHide = false;

        this.visible = undefined;

        this._source = MarkerSet.Source.CUSTOM;

        this._marker = {};
    }

    update(markerSetData) {
        this._source = MarkerSet.Source.MARKER_FILE;

        this.label = markerSetData.label ? markerSetData.label : this.id;
        this.toggleable = markerSetData.toggleable !== undefined ? !!markerSetData.toggleable : true;
        this.defaultHide = !!markerSetData.defaultHide;
        if (this.visible === undefined) this.visible = this.defaultHide;

        let prevMarkers = this._marker;
        this._marker = {};
        if (Array.isArray(markerSetData.marker)){
            for (let markerData of markerSetData.marker) {
                let markerId = markerData.id;
                if (!markerId) continue;
                if (this._marker[markerId]) continue; // skip duplicate id's

                let mapId = markerData.map;
                if (mapId !== this._mapId) continue;

                this._marker[markerId] = prevMarkers[markerId];
                delete prevMarkers[markerId];

                this.updateMarker(markerId, markerData);
            }
        }

        //remaining (removed) markers
        for (let markerId in prevMarkers) {
            if (!prevMarkers.hasOwnProperty(markerId)) continue;
            if (!prevMarkers[markerId] || !prevMarkers[markerId].isMarker) continue;

            // keep markers that were not loaded from the marker-file
            if (prevMarkers[markerId]._source !== Marker.Source.MARKER_FILE){
                this._marker[markerId] = prevMarkers[markerId];
                continue;
            }

            prevMarkers[markerId].dispose();
        }
    }

    updateMarker(markerId, markerData){
        let markerType = markerData.type;
        if (!markerType) return;

        if (!this._marker[markerId] || !this._marker[markerId].isMarker) {
            this.createMarker(markerId, markerType);
        } else if (this._marker[markerId].type !== markerType){
            this._marker[markerId].dispose();
            this.createMarker(markerId, markerType);
        }

        if (!this._marker[markerId]) return;

        this._marker[markerId].update(markerData);
    }

    createMarker(id, type) {
        switch (type) {
            case "html" : this._marker[id] = new HTMLMarker(this, id, this._elementMarkerObject); break;
            case "poi" : this._marker[id] = new POIMarker(this, id, this._elementMarkerObject); break;
            case "shape" : this._marker[id] = new ShapeMarker(this, id, this._objectMarkerObject); break;
            case "line" : this._marker[id] = new LineMarker(this, id, this._objectMarkerObject); break;
            case "extrude" : this._marker[id] = new ExtrudeMarker(this, id, this._objectMarkerObject); break;
            default : return null;
        }

        return this._marker[id];
    }

    createPlayerMarker(playerUuid) {
        let id = playerUuid;
        this._marker[id] = new PlayerMarker(this, id, this._elementMarkerObject, playerUuid);
        return this._marker[id];
    }

    get marker() {
        return this._marker.values();
    }

    dispose() {
        let marker = {...this._marker};
        for (let markerId in marker){
            if (!marker.hasOwnProperty(markerId)) continue;
            if (!marker[markerId] || !marker[markerId].isMarker) continue;

            marker[markerId].dispose();
        }

        this._marker = {};
        delete this.manager.markerSets[this.id];
    }

}