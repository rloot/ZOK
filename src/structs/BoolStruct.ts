import { Field, SmartContract, state, State, method, Poseidon, Bool, Struct } from "snarkyjs";
export class BoolStruct extends Struct({
    boolean1: Bool
}) {
    constructor(boolean1: Bool) {
        super({ boolean1 });
        this.check();
    }
    public check() {
    }
    _assert(expr: unknown, msg?: string) { if (!expr)
        throw new Error(msg); }
}
