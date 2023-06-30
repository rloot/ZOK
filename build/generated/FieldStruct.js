"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldStruct = void 0;
const snarkyjs_1 = require("snarkyjs");
class FieldStruct extends (0, snarkyjs_1.Struct)({
    f: snarkyjs_1.Field,
    g: snarkyjs_1.Field,
    h: snarkyjs_1.Field,
    i: snarkyjs_1.Field
}) {
    constructor(f, g, h, i) {
        super({ f, g, h, i });
        this.check();
    }
    check() {
        this.f.assertLessThan(10, "f must be less than 10");
        // exclusive minimum
        this.g.assertGreaterThan(0, "g must be greater than 0");
        this.h.assertLessThanOrEqual(5, "h must be less or equal than 5");
        this.i.assertGreaterThanOrEqual(0, "i must be greater or equal than 0");
    }
    _assert(expr, msg) {
        if (!expr)
            throw new Error(msg);
    }
}
exports.FieldStruct = FieldStruct;
