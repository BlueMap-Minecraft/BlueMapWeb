import {HTMLMarker} from "./HTMLMarker";

export class PlayerMarker extends HTMLMarker {

    constructor(markerSet, id, parentObject, playerUuid) {
        super(markerSet, id, parentObject);
        this._markerElement.classList.add("bm-marker-player");

        Object.defineProperty(this, 'isPlayerMarker', {value: true});

        this._name = id;
        this._head = "assets/playerheads/steve.png";
        this.playerUuid = playerUuid;

        this.updateHtml();
    }

    onClick(clickPosition) {
        this.followLink();

        this._markerElement.classList.add("bm-marker-poi-show-label");

        let onRemoveLabel = () => {
            this._markerElement.classList.remove("bm-marker-poi-show-label");
        };

        this.manager.events.addEventListener('bluemapPopupMarker', onRemoveLabel, {once: true});
        setTimeout(() => {
            this.manager.events.addEventListener('bluemapCameraMoved', onRemoveLabel, {once: true});
        }, 1000);
    }

    set name(name){
        this._name = name;

        this.updateHtml();
    }

    set head(headImage) {
        this._head = headImage;

        this.updateHtml();
    }

    updateHtml() {
        let labelHtml = '';
        if (this._name) labelHtml = `<div class="bm-marker-poi-label">${this._name}</div>`;

        this.html = `<img src="${this._head}" alt="PlayerHead-${this.id}" draggable="false">${labelHtml}`;
    }

}