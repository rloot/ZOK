"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateStruct = void 0;
const snarkyjs_1 = require("snarkyjs");
class DateStruct extends (0, snarkyjs_1.Struct)({
    birthday: snarkyjs_1.Field,
    minDate: snarkyjs_1.Field,
    maxDate: snarkyjs_1.Field
}) {
    constructor(birthday, minDate, maxDate) {
        super({ birthday, minDate, maxDate });
        this.check();
    }
    check() {
        this.minDate.assertGreaterThanOrEqual(86400000, "minDate must be greater or equal than 86400000");
        this.minDate.assertGreaterThanOrEqual(86400000, "minDate must be greater or equal than 86400000");
        this.maxDate.assertLessThanOrEqual(63158400000, "maxDate must be less or equal than 63158400000");
        this.maxDate.assertLessThanOrEqual(63158400000, "maxDate must be less or equal than 63158400000");
    }
    _assert(expr, msg) {
        if (!expr)
            throw new Error(msg);
    }
}
exports.DateStruct = DateStruct;
