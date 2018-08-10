"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Generate {
    constructor() {
        this.rand;
    }
    rand() {
        return Math.random().toString(36).substr(2); // remove `0.`
    }
    getToken() {
        return this.rand() + this.rand();
    }
}
exports.Generate = Generate;
//# sourceMappingURL=generateToken.js.map