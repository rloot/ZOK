import { Field, Struct } from "snarkyjs";
export class Square extends Struct({
    num: Field
}) {
    constructor(num) {
        super({ num });
        this.check();
    }
    check() {
        this.num.assertGreaterThanOrEqual(0, "num must be greater or equal than 0");
    }
    _assert(expr, msg) {
        if (!expr)
            throw new Error(msg);
    }
}
//# sourceMappingURL=Square.js.map