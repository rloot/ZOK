import { Field, SmartContract, state, State, method, Poseidon, Bool, Struct } from "snarkyjs";
export class DateStruct extends Struct({
    birthday: Field,
    minDate: Field,
    maxDate: Field
}) {
    constructor(birthday: Field, minDate: Field, maxDate: Field) {
        super({ birthday, minDate, maxDate });
        this.check();
    }
    public check() {
        this.minDate.assertGreaterThanOrEqual(86400000, "minDate must be greater or equal than 86400000")
        this.maxDate.assertLessThanOrEqual(63158400000, "maxDate must be less or equal than 63158400000")
    }
    _assert(expr: unknown, msg?: string) { if (!expr)
        throw new Error(msg); }
}
