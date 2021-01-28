/**
 * Takes a base46 string and converts it into an image element
 * @param string {string}
 * @returns {HTMLElement}
 */
import {MathUtils} from "three";

export const stringToImage = string => {
    let image = document.createElementNS('http://www.w3.org/1999/xhtml', 'img');
    image.src = string;
    return image;
};

/**
 * Creates an optimized path from x,z coordinates used by bluemap to save tiles
 * @param x {number}
 * @param z {number}
 * @returns {string}
 */
export const pathFromCoords = (x, z) => {
    let path = 'x';
    path += splitNumberToPath(x);

    path += 'z';
    path += splitNumberToPath(z);

    path = path.substring(0, path.length - 1);

    return path;
};

/**
 * Splits a number into an optimized folder-path used to save bluemap-tiles
 * @param num {number}
 * @returns {string}
 */
const splitNumberToPath = num => {
    let path = '';

    if (num < 0) {
        num = -num;
        path += '-';
    }

    let s = num.toString();

    for (let i = 0; i < s.length; i++) {
        path += s.charAt(i) + '/';
    }

    return path;
};

/**
 * Hashes tile-coordinates to be saved in a map
 * @param x {number}
 * @param z {number}
 * @returns {string}
 */
export const hashTile = (x, z) => `x${x}z${z}`;


/**
 * Dispatches an event to the element of this map-viewer
 * @param element {EventTarget} the element on that the event is dispatched
 * @param event {string}
 * @param detail {object}
 * @returns {undefined|void|boolean}
 */
export const dispatchEvent = (element, event, detail = {}) => {
    if (!element || !element.dispatchEvent) return;

    return element.dispatchEvent(new CustomEvent(event, {
        detail: detail
    }));
}

/**
 * Sends a "bluemapAlert" event with a message and a level.
 * The level can be anything, but the app uses the levels
 * - debug
 * - fine
 * - info
 * - warning
 * - error
 * @param element {EventTarget} the element on that the event is dispatched
 * @param message {string}
 * @param level {string}
 */
export const alert = (element, message, level = "info") => {

    // alert event
    let printToConsole = dispatchEvent(element, "bluemapAlert", {
        message: message,
        level: level
    });

    // log alert to console
    if (printToConsole) {
        if (level === "info") {
            console.log(`[BlueMap/${level}]`, message);
        } else if (level === "warning") {
            console.warn(`[BlueMap/${level}]`, message);
        } else if (level === "error") {
            console.error(`[BlueMap/${level}]`, message);
        } else {
            console.debug(`[BlueMap/${level}]`, message);
        }
    }
}

/**
 * Source: https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
 *
 * @param html {string} representing a single element
 * @return {Element}
 */
export const htmlToElement = html => {
    let template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
}

/**
 * Source: https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
 *
 * @param html {string} representing any number of sibling elements
 * @return {NodeList}
 */
export const htmlToElements = html => {
    let template = document.createElement('template');
    template.innerHTML = html;
    return template.content.childNodes;
}

/**
 * Schedules an animation
 * @param durationMs {number} the duration of the animation in ms
 * @param animationFrame {function(progress: number, deltaTime: number)} a function that is getting called each frame with the parameters (progress (0-1), deltaTime)
 * @param postAnimation {function(finished: boolean)} a function that gets called once after the animation is finished or cancelled. The function accepts one bool-parameter whether the animation was finished (true) or canceled (false)
 * @returns {{cancel: function()}} the animation object
 */
export const animate = function (animationFrame, durationMs = 1000, postAnimation = null) {
    let animation = {
        animationStart: -1,
        lastFrame: -1,
        cancelled: false,

        frame: function (time) {
            if (this.cancelled) return;

            if (this.animationStart === -1) {
                this.animationStart = time;
                this.lastFrame = time;
            }

            let progress = MathUtils.clamp((time - this.animationStart) / durationMs, 0, 1);
            let deltaTime = time - this.lastFrame;

            animationFrame(progress, deltaTime);

            if (progress < 1) window.requestAnimationFrame(time => this.frame(time));
            else if (postAnimation) postAnimation(true);

            this.lastFrame = time;
        },

        cancel: function () {
            this.cancelled = true;
            if (postAnimation) postAnimation(false);
        }
    };

    window.requestAnimationFrame(time => animation.frame(time));

    return animation;
}

/**
 * Returns the offset position of an element
 *
 * Source: https://plainjs.com/javascript/styles/get-the-position-of-an-element-relative-to-the-document-24/
 *
 * @param element {Element}
 * @returns {{top: number, left: number}}
 */
export const elementOffset = element => {
    let rect = element.getBoundingClientRect(),
        scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
}

/**
 * Very simple deep equals, should not be used for complex objects. Is designed for comparing parsed json-objects.
 * @param object1 {object}
 * @param object2 {object}
 * @returns {boolean}
 */
export const deepEquals = (object1, object2) => {
    if (Object.is(object1, object2)) return true;

    let type = typeof object1;
    if (type !== typeof object2) return false;

    if (type === 'number' || type === 'boolean' || type === 'string') return false;

    if (Array.isArray(object1)){
        let len = object1.length;
        if (len !== object2.length) return false;
        for (let i = 0; i < len; i++) {
            if (!deepEquals(object1[i], object2[i])) return false;
        }

        return true;
    }

    for (let property in object1) {
        if (!object1.hasOwnProperty(property)) continue;
        if (!deepEquals(object1[property], object2[property])) return false;
    }

    return true;
}
