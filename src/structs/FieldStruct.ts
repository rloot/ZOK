import { Field, SmartContract, state, State, method, Poseidon, Bool, Struct } from "snarkyjs";
export class FieldStruct extends Struct({
    f: Field,
    g: Field,
    h: Field,
    i: Field
}) {
    constructor(f: Field, g: Field, h: Field, i: Field) {
        super({ f, g, h, i });
        this.check();
    }
    public check() {
        // Check
        this.f.assertLessThan(10, "f must be less than 10")
        // exclusive minimum
        this.g.assertGreaterThan(0, "g must be greater than 0")
        this.h.assertLessThanOrEqual(5, "h must be less or equal than 5")
        this.i.assertGreaterThanOrEqual(0, "i must be greater or equal than 0")
    }
    _assert(expr: unknown, msg?: string) { if (!expr)
        throw new Error(msg); }
}
