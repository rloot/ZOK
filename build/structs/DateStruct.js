import { Field, Struct } from "snarkyjs";
export class DateStruct extends Struct({
    birthday: Field,
    minDate: Field,
    maxDate: Field
}) {
    constructor(birthday, minDate, maxDate) {
        super({ birthday, minDate, maxDate });
        this.check();
    }
    check() {
        this.minDate.assertGreaterThanOrEqual(86400000, "minDate must be greater or equal than 86400000");
        this.maxDate.assertLessThanOrEqual(63158400000, "maxDate must be less or equal than 63158400000");
    }
    _assert(expr, msg) {
        if (!expr)
            throw new Error(msg);
    }
}
//# sourceMappingURL=DateStruct.js.map