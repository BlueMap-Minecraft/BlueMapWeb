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

export class MarkerSet extends Scene {

    /**
     * @param id {string}
     */
    constructor(id) {
        super();
        Object.defineProperty(this, 'isMarkerSet', {value: true});

        this.data = {
            id: id,
            label: id,
            toggleable: true,
            defaultHide: false,
            markerSets: [],
            markers: [],
            visible: this.visible,
        };

        Object.defineProperty(this, "visible", {
            get() { return this.data.visible },
            set(value) { this.data.visible = value }
        });
    }

    add(...object) {
        if (object.length === 1) { //super.add() will re-invoke this method for each array-entry if its more than one
            let o = object[0];
            if (o.isMarkerSet) {
                this.data.markerSets.push(o.data);
            }
            if (o.isMarker) {
                this.data.markers.push(o.data);
            }
        }

        return super.add(...object);
    }

    remove(...object) {
        if (object.length === 1) { //super.remove() will re-invoke this method for each array-entry if its more than one
            let o = object[0];
            if (o.isMarkerSet) {
                let i = this.data.markerSets.indexOf(o.data);
                if (i > -1) this.data.markerSets.splice(i, 1);
            }
            if (o.isMarker) {
                let i = this.data.markers.indexOf(o.data);
                if (i > -1) this.data.markers.splice(i, 1);
            }
        }

        return super.remove(...object);
    }

    dispose() {
        this.children.forEach(child => {
            if (child.dispose) child.dispose();
        });
    }

}