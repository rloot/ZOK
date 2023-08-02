import { __decorate, __metadata } from "tslib";
import { Bool, CircuitValue, Field, Provable, prop, UInt64 } from "snarkyjs";

// external API
export { UInt240 };
/**
 * A 64 bit unsigned integer with values ranging from 0 to 18,446,744,073,709,551,615.
 */
class UInt240 extends CircuitValue {
    /**
     * Static method to create a {@link UInt240} with value `0`.
     */
    static get zero() {
        return new UInt240(Field(0));
    }
    /**
     * Static method to create a {@link UInt240} with value `1`.
     */
    static get one() {
        return new UInt240(Field(1));
    }
    /**
     * Turns the {@link UInt240} into a string.
     * @returns
     */
    toString() {
        return this.value.toString();
    }
    /**
     * Turns the {@link UInt240} into a {@link BigInt}.
     * @returns
     */
    toBigInt() {
        return this.value.toBigInt();
    }
    /**
     * Turns the {@link UInt240} into a {@link UInt32}, asserting that it fits in 32 bits.
     */
    toUInt32() {
        let uint32 = new UInt32(this.value);
        UInt32.check(uint32);
        return uint32;
    }
    /**
     * Turns the {@link UInt240} into a {@link UInt32}, clamping to the 32 bits range if it's too large.
     * ```ts
     * UInt240.from(4294967296).toUInt32Clamped().toString(); // "4294967295"
     * ```
     */
    toUInt32Clamped() {
        let max = (1n << 32n) - 1n;
        return Provable.if(this.greaterThan(UInt240.from(max)), UInt32.from(max), new UInt32(this.value));
    }
    static check(x) {
        let actual = x.value.rangeCheckHelper(UInt240.NUM_BITS);
        actual.assertEquals(x.value);
    }
    static toInput(x) {
        return { packed: [[x.value, UInt240.NUM_BITS]] };
    }
    /**
     * Encodes this structure into a JSON-like object.
     */
    static toJSON(x) {
        return x.value.toString();
    }
    /**
     * Decodes a JSON-like object into this structure.
     */
    static fromJSON(x) {
        return this.from(x);
    }
    static checkConstant(x) {
        if (!x.isConstant())
            return x;
        let xBig = x.toBigInt();
        if (xBig < 0n || xBig >= 1n << BigInt(this.NUM_BITS)) {
            throw Error(`UInt240: Expected number between 0 and 2^240 - 1, got ${xBig}`);
        }
        return x;
    }
    // this checks the range if the argument is a constant
    /**
     * Creates a new {@link UInt240}.
     */
    static from(x) {
        if (x instanceof UInt240 || x instanceof UInt64)
            x = x.value;
        return new this(this.checkConstant(Field(x)));
    }
    /**
     * Creates a {@link UInt240} with a value of 18,446,744,073,709,551,615.
     */
    static MAXINT() {
        return new UInt240(Field((1n << 240n) - 1n));
    }
    /**
     * Integer division with remainder.
     *
     * `x.divMod(y)` returns the quotient and the remainder.
     */
    divMod(y) {
        let x = this.value;
        let y_ = UInt240.from(y).value;
        if (this.value.isConstant() && y_.isConstant()) {
            let xn = x.toBigInt();
            let yn = y_.toBigInt();
            let q = xn / yn;
            let r = xn - q * yn;
            return {
                quotient: new UInt240(Field(q)),
                rest: new UInt240(Field(r)),
            };
        }
        y_ = y_.seal();
        let q = Provable.witness(Field, () => new Field(x.toBigInt() / y_.toBigInt()));
        q.rangeCheckHelper(UInt240.NUM_BITS).assertEquals(q);
        // TODO: Could be a bit more efficient
        let r = x.sub(q.mul(y_)).seal();
        r.rangeCheckHelper(UInt240.NUM_BITS).assertEquals(r);
        let r_ = new UInt240(r);
        let q_ = new UInt240(q);
        r_.assertLessThan(new UInt240(y_));
        return { quotient: q_, rest: r_ };
    }
    /**
     * Integer division.
     *
     * `x.div(y)` returns the floor of `x / y`, that is, the greatest
     * `z` such that `z * y <= x`.
     *
     */
    div(y) {
        return this.divMod(y).quotient;
    }
    /**
     * Integer remainder.
     *
     * `x.mod(y)` returns the value `z` such that `0 <= z < y` and
     * `x - z` is divisble by `y`.
     */
    mod(y) {
        return this.divMod(y).rest;
    }
    /**
     * Multiplication with overflow checking.
     */
    mul(y) {
        let z = this.value.mul(UInt240.from(y).value);
        z.rangeCheckHelper(UInt240.NUM_BITS).assertEquals(z);
        return new UInt240(z);
    }
    /**
     * Addition with overflow checking.
     */
    add(y) {
        let z = this.value.add(UInt240.from(y).value);
        z.rangeCheckHelper(UInt240.NUM_BITS).assertEquals(z);
        return new UInt240(z);
    }
    /**
     * Subtraction with underflow checking.
     */
    sub(y) {
        let z = this.value.sub(UInt240.from(y).value);
        z.rangeCheckHelper(UInt240.NUM_BITS).assertEquals(z);
        return new UInt240(z);
    }
    /**
     * @deprecated Use {@link lessThanOrEqual} instead.
     *
     * Checks if a {@link UInt240} is less than or equal to another one.
     */
    lte(y) {
        if (this.value.isConstant() && y.value.isConstant()) {
            return Bool(this.value.toBigInt() <= y.value.toBigInt());
        }
        else {
            let xMinusY = this.value.sub(y.value).seal();
            let yMinusX = xMinusY.neg();
            let xMinusYFits = xMinusY
                .rangeCheckHelper(UInt240.NUM_BITS)
                .equals(xMinusY);
            let yMinusXFits = yMinusX
                .rangeCheckHelper(UInt240.NUM_BITS)
                .equals(yMinusX);
            xMinusYFits.or(yMinusXFits).assertEquals(true);
            // x <= y if y - x fits in 64 bits
            return yMinusXFits;
        }
    }
    /**
     * Checks if a {@link UInt240} is less than or equal to another one.
     */
    lessThanOrEqual(y) {
        if (this.value.isConstant() && y.value.isConstant()) {
            return Bool(this.value.toBigInt() <= y.value.toBigInt());
        }
        else {
            let xMinusY = this.value.sub(y.value).seal();
            let yMinusX = xMinusY.neg();
            let xMinusYFits = xMinusY
                .rangeCheckHelper(UInt240.NUM_BITS)
                .equals(xMinusY);
            let yMinusXFits = yMinusX
                .rangeCheckHelper(UInt240.NUM_BITS)
                .equals(yMinusX);
            xMinusYFits.or(yMinusXFits).assertEquals(true);
            // x <= y if y - x fits in 64 bits
            return yMinusXFits;
        }
    }
    /**
     * @deprecated Use {@link assertLessThanOrEqual} instead.
     *
     * Asserts that a {@link UInt240} is less than or equal to another one.
     */
    assertLte(y, message) {
        this.assertLessThanOrEqual(y, message);
    }
    /**
     * Asserts that a {@link UInt240} is less than or equal to another one.
     */
    assertLessThanOrEqual(y, message) {
        if (this.value.isConstant() && y.value.isConstant()) {
            let x0 = this.value.toBigInt();
            let y0 = y.value.toBigInt();
            if (x0 > y0) {
                if (message !== undefined)
                    throw Error(message);
                throw Error(`UInt240.assertLessThanOrEqual: expected ${x0} <= ${y0}`);
            }
            return;
        }
        let yMinusX = y.value.sub(this.value).seal();
        yMinusX.rangeCheckHelper(UInt240.NUM_BITS).assertEquals(yMinusX, message);
    }
    /**
     * @deprecated Use {@link lessThan} instead.
     *
     * Checks if a {@link UInt240} is less than another one.
     */
    lt(y) {
        return this.lessThanOrEqual(y).and(this.value.equals(y.value).not());
    }
    /**
     *
     * Checks if a {@link UInt240} is less than another one.
     */
    lessThan(y) {
        return this.lessThanOrEqual(y).and(this.value.equals(y.value).not());
    }
    /**
     *
     * @deprecated Use {@link assertLessThan} instead.
     *
     * Asserts that a {@link UInt240} is less than another one.
     */
    assertLt(y, message) {
        this.lessThan(y).assertEquals(true, message);
    }
    /**
     * Asserts that a {@link UInt240} is less than another one.
     */
    assertLessThan(y, message) {
        this.lessThan(y).assertEquals(true, message);
    }
    /**
     * @deprecated Use {@link greaterThan} instead.
     *
     * Checks if a {@link UInt240} is greater than another one.
     */
    gt(y) {
        return y.lessThan(this);
    }
    /**
     * Checks if a {@link UInt240} is greater than another one.
     */
    greaterThan(y) {
        return y.lessThan(this);
    }
    /**
     * @deprecated Use {@link assertGreaterThan} instead.
     *
     * Asserts that a {@link UInt240} is greater than another one.
     */
    assertGt(y, message) {
        y.assertLessThan(this, message);
    }
    /**
     * Asserts that a {@link UInt240} is greater than another one.
     */
    assertGreaterThan(y, message) {
        y.assertLessThan(this, message);
    }
    /**
     * @deprecated Use {@link greaterThanOrEqual} instead.
     *
     * Checks if a {@link UInt240} is greater than or equal to another one.
     */
    gte(y) {
        return this.lessThan(y).not();
    }
    /**
     * Checks if a {@link UInt240} is greater than or equal to another one.
     */
    greaterThanOrEqual(y) {
        return this.lessThan(y).not();
    }
    /**
     * @deprecated Use {@link assertGreaterThanOrEqual} instead.
     *
     * Asserts that a {@link UInt240} is greater than or equal to another one.
     */
    assertGte(y, message) {
        y.assertLessThanOrEqual(this, message);
    }
    /**
     * Asserts that a {@link UInt240} is greater than or equal to another one.
     */
    assertGreaterThanOrEqual(y, message) {
        y.assertLessThanOrEqual(this, message);
    }
}
UInt240.NUM_BITS = 240;
__decorate([
    prop,
    __metadata("design:type", Field)
], UInt240.prototype, "value", void 0);


// __decorate([
//     prop,
//     __metadata("design:type", UInt240)
// ], Int64.prototype, "magnitude", void 0);
// __decorate([
//     prop,
//     __metadata("design:type", Sign)
// ], Int64.prototype, "sgn", void 0);
// //# sourceMappingURL=int.js.map