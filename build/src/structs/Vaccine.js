import { Field, Struct } from "snarkyjs";
export class Vaccine extends Struct({
    issuer: Field,
    expiration: Field
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
//# sourceMappingURL=Vaccine.js.map