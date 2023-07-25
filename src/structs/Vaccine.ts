import { Field, SmartContract, state, State, method, Poseidon, Bool, Struct } from "snarkyjs";
export class Vaccine extends Struct({
    issuer: Field,
    expiration: Field
}) {
    constructor(issuer: Field, expiration: Field) {
        super({ issuer, expiration });
        this.check();
    }
    public check() {
        // Check
        // exclusive minimum
        this.issuer.assertGreaterThan(0, "issuer must be greater than 0")
        // exclusive minimum
        this.expiration.assertGreaterThan(0, "expiration must be greater than 0")
    }
    _assert(expr: unknown, msg?: string) { if (!expr)
        throw new Error(msg); }
}
