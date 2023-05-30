import { Field, SmartContract, state, State, method, Poseidon, Bool, Struct } from "snarkyjs";
export class Square extends Struct({
    a: Field,
    b: Field,
    c: Field,
    d: Field,
    e: Field,
    f: Field,
    g: Field,
    h: Field,
    i: Field
}) {
    public check() {
        // exclusive minimum
        this._assert(this.a.greaterThanOrEqual(0), "a must be greater or equal than 0")
        this._assert(this.e.greaterThan(0), "e must be greater than 0")
        this._assert(this.e.greaterThanOrEqual(100), "e must be less than 100")
        this._assert(this.f.lessThanOrEqual(0), "f must be less or equal than 0")
        // exclusive minimum
        this._assert(this.g.greaterThanOrEqual(0), "g must be greater or equal than 0")
        this._assert(this.h.greaterThanOrEqual(0), "h must be less than 0")
        this._assert(this.i.greaterThan(0), "i must be greater than 0")
    }
    public _assert(expr: unknown, msg?: string) {
        if (!expr)
            throw new Error(msg);
    }
}
