import { Field, SmartContract, state, State, method, Poseidon, Bool, Struct } from "snarkyjs";
export class Square extends Struct({
  num: Field
}) {
  public check() {
    // exclusive minimum
    this._assert(this.num.greaterThanOrEqual(0), "num must be greater or equal than 0")
  }
  public _assert(expr: unknown, msg?: string) {
    if (!expr)
      throw new Error(msg);
  }
}
