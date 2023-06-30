"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vaccine = void 0;
const snarkyjs_1 = require("snarkyjs");
class Vaccine extends (0, snarkyjs_1.Struct)({
    issuer: snarkyjs_1.Field,
    expiration: snarkyjs_1.Field
}) {
    constructor(issuer, expiration) {
        super({ issuer, expiration });
        this.check();
    }
    check() {
        // exclusive minimum
        this.issuer.assertGreaterThan(0, "issuer must be greater than 0");
        // exclusive minimum
        this.expiration.assertGreaterThan(0, "expiration must be greater than 0");
    }
    _assert(expr, msg) {
        if (!expr)
            throw new Error(msg);
    }
}
exports.Vaccine = Vaccine;
