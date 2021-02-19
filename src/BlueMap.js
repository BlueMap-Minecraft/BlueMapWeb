import {Object3D} from "three";

export * from "./MapViewer";

export * from "./map/Map";
export * from "./map/Tile";
export * from "./map/TileLoader";
export * from "./map/TileManager";
export * from "./map/TileMap";

export * from "./markers/ExtrudeMarker";
export * from "./markers/HtmlMarker";
export * from "./markers/LineMarker";
export * from "./markers/Marker";
export * from "./markers/MarkerFileManager";
export * from "./markers/MarkerManager";
export * from "./markers/MarkerSet";
export * from "./markers/ObjectMarker";
export * from "./markers/PlayerMarker";
export * from "./markers/PlayerMarkerManager";
export * from "./markers/PoiMarker";
export * from "./markers/ShapeMarker";

export * from "./controls/map/MapControls";
export * from "./controls/freeflight/FreeFlightControls";

export * from "./util/CombinedCamera";
export * from "./util/Utils";

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
