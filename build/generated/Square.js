"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Square = void 0;
const snarkyjs_1 = require("snarkyjs");
class Square extends (0, snarkyjs_1.Struct)({
    num: snarkyjs_1.Field
}) {
    constructor(num) {
        super({ num });
        this.check();
    }
    check() {
        this.num.assertGreaterThanOrEqual(0, "num must be greater or equal than 0");
    }
    _assert(expr, msg) {
        if (!expr)
            throw new Error(msg);
    }
}
exports.Square = Square;
