export class KeyCombination {

    static CTRL = 0;
    static SHIFT = 1;
    static ALT = 2;

    /**
     * @param code {string}
     * @param modifiers {...number}
     */
    constructor(code, ...modifiers) {

        this.code = code;
        this.ctrl = modifiers.includes(KeyCombination.CTRL) || this.code === "CtrlLeft" || this.code === "CtrlRight";
        this.shift = modifiers.includes(KeyCombination.SHIFT) || this.code === "ShiftLeft" || this.code === "ShiftRight";
        this.alt = modifiers.includes(KeyCombination.ALT) || this.code === "AltLeft" || this.code === "AltRight";

    }

    /**
     * @param evt {KeyboardEvent}
     * @returns {boolean}
     */
    testDown(evt) {
        return this.code === evt.code &&
            this.ctrl === evt.ctrlKey &&
            this.shift === evt.shiftKey &&
            this.alt === evt.altKey;
    }

    /**
     * @param evt {KeyboardEvent}
     * @returns {boolean}
     */
    testUp(evt) {
        return this.code === evt.code;
    }

    static oneDown(evt, ...combinations) {
        for (let combination of combinations){
            if (combination.testDown(evt)) return true;
        }
        return false;
    }

    static oneUp(evt, ...combinations) {
        for (let combination of combinations){
            if (combination.testUp(evt)) return true;
        }
        return false;
    }

}