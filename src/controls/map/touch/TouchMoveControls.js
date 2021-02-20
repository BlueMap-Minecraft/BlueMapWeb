import {MathUtils, Vector2} from "three";
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

import {VEC2_ZERO} from "../../../util/Utils";

export class TouchMoveControls {

    static tempVec2_1 = new Vector2();

    /**
     * @param hammer {Manager}
     * @param speed {number}
     * @param stiffness {number}
     */
    constructor(hammer, speed, stiffness) {
        this.hammer = hammer;
        this.manager = null;

        this.moving = false;
        this.lastPosition = new Vector2();
        this.deltaPosition = new Vector2();

        this.speed = speed;
        this.stiffness = stiffness;
    }

    /**
     * @param manager {ControlsManager}
     */
    start(manager) {
        this.manager = manager;

        this.hammer.on("movestart", this.onTouchDown);
        this.hammer.on("movemove", this.onTouchMove);
        this.hammer.on("moveend", this.onTouchUp);
        this.hammer.on("movecancel", this.onTouchUp);
    }

    stop() {
        this.hammer.off("movestart", this.onTouchDown);
        this.hammer.off("movemove", this.onTouchMove);
        this.hammer.off("moveend", this.onTouchUp);
        this.hammer.off("movecancel", this.onTouchUp);
    }

    /**
     * @param delta {number}
     * @param map {Map}
     */
    update(delta, map) {
        if (this.deltaPosition.x === 0 && this.deltaPosition.y === 0) return;

        let smoothing = this.stiffness / (16.666 / delta);
        smoothing = MathUtils.clamp(smoothing, 0, 1);

        let directionDelta = TouchMoveControls.tempVec2_1.copy(this.deltaPosition);
        directionDelta.rotateAround(VEC2_ZERO, this.manager.rotation);

        this.manager.position.x += directionDelta.x * smoothing * this.manager.distance * this.speed;
        this.manager.position.z += directionDelta.y * smoothing * this.manager.distance * this.speed;

        this.deltaPosition.multiplyScalar(1 - smoothing);
        if (this.deltaPosition.lengthSq() < 0.0001) {
            this.deltaPosition.set(0, 0);
        }
    }

    reset() {
        this.deltaPosition.set(0, 0);
    }

    /**
     * @private
     * @param evt {object}
     */
    onTouchDown = evt => {
        if (evt.pointerType === "mouse") return;

        this.moving = true;
        this.deltaPosition.set(0, 0);
        this.lastPosition.set(evt.center.x, evt.center.y);
    }

    /**
     * @private
     * @param evt {object}
     */
    onTouchMove = evt => {
        if (evt.pointerType === "mouse") return;

        let position = TouchMoveControls.tempVec2_1.set(evt.center.x, evt.center.y);

        if(this.moving){
            this.deltaPosition.sub(position).add(this.lastPosition);
        }

        this.lastPosition.copy(position);
    }

    /**
     * @private
     * @param evt {object}
     */
    onTouchUp = evt => {
        if (evt.pointerType === "mouse") return;

        this.moving = false;
    }

}