"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoolStruct = void 0;
const snarkyjs_1 = require("snarkyjs");
class BoolStruct extends (0, snarkyjs_1.Struct)({
    boolean1: snarkyjs_1.Bool
}) {
    constructor(boolean1) {
        super({ boolean1 });
        this.check();
    }
    check() {
    }
    _assert(expr, msg) {
        if (!expr)
            throw new Error(msg);
    }
}
exports.BoolStruct = BoolStruct;
