import { Field, Bool } from "snarkyjs";
declare const BoolStruct_base: (new (value: {
    boolean1: Bool;
}) => {
    boolean1: Bool;
}) & {
    _isStruct: true;
} & import("snarkyjs/dist/node/snarky").ProvablePure<{
    boolean1: Bool;
}> & {
    toInput: (x: {
        boolean1: Bool;
    }) => {
        fields?: Field[];
        packed?: [Field, number][];
    };
    toJSON: (x: {
        boolean1: Bool;
    }) => {
        boolean1: boolean;
    };
    fromJSON: (x: {
        boolean1: boolean;
    }) => {
        boolean1: Bool;
    };
};
export declare class BoolStruct extends BoolStruct_base {
    constructor(boolean1: Bool);
    check(): void;
    _assert(expr: unknown, msg?: string): void;
}
export {};
