import { Field } from "snarkyjs";
declare const FieldStruct_base: (new (value: {
    f: Field;
    g: Field;
    h: Field;
    i: Field;
}) => {
    f: Field;
    g: Field;
    h: Field;
    i: Field;
}) & {
    _isStruct: true;
} & import("snarkyjs/dist/node/snarky").ProvablePure<{
    f: Field;
    g: Field;
    h: Field;
    i: Field;
}> & {
    toInput: (x: {
        f: Field;
        g: Field;
        h: Field;
        i: Field;
    }) => {
        fields?: Field[];
        packed?: [Field, number][];
    };
    toJSON: (x: {
        f: Field;
        g: Field;
        h: Field;
        i: Field;
    }) => {
        f: string;
        g: string;
        h: string;
        i: string;
    };
    fromJSON: (x: {
        f: string;
        g: string;
        h: string;
        i: string;
    }) => {
        f: Field;
        g: Field;
        h: Field;
        i: Field;
    };
};
export declare class FieldStruct extends FieldStruct_base {
    constructor(f: Field, g: Field, h: Field, i: Field);
    check(): void;
    _assert(expr: unknown, msg?: string): void;
}
export {};
