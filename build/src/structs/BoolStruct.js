import { Bool, Struct } from "snarkyjs";
export class BoolStruct extends Struct({
    boolean1: Bool
}) {
    constructor(boolean1) {
        super({ boolean1 });
        this.check();
    }
    check() {
    }
    _assert(expr, msg) {
        if (!expr)
            throw new Error(msg);
    }
}
//# sourceMappingURL=BoolStruct.js.map