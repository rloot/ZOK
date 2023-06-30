import { Field } from "snarkyjs";
declare const Square_base: (new (value: {
    num: Field;
}) => {
    num: Field;
}) & {
    _isStruct: true;
} & import("snarkyjs/dist/node/snarky").ProvablePure<{
    num: Field;
}> & {
    toInput: (x: {
        num: Field;
    }) => {
        fields?: Field[];
        packed?: [Field, number][];
    };
    toJSON: (x: {
        num: Field;
    }) => {
        num: string;
    };
    fromJSON: (x: {
        num: string;
    }) => {
        num: Field;
    };
};
export declare class Square extends Square_base {
    constructor(num: Field);
    check(): void;
    _assert(expr: unknown, msg?: string): void;
}
export {};
