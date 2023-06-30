import { Field } from "snarkyjs";
declare const DateStruct_base: (new (value: {
    birthday: Field;
    minDate: Field;
    maxDate: Field;
}) => {
    birthday: Field;
    minDate: Field;
    maxDate: Field;
}) & {
    _isStruct: true;
} & import("snarkyjs/dist/node/snarky").ProvablePure<{
    birthday: Field;
    minDate: Field;
    maxDate: Field;
}> & {
    toInput: (x: {
        birthday: Field;
        minDate: Field;
        maxDate: Field;
    }) => {
        fields?: Field[];
        packed?: [Field, number][];
    };
    toJSON: (x: {
        birthday: Field;
        minDate: Field;
        maxDate: Field;
    }) => {
        birthday: string;
        minDate: string;
        maxDate: string;
    };
    fromJSON: (x: {
        birthday: string;
        minDate: string;
        maxDate: string;
    }) => {
        birthday: Field;
        minDate: Field;
        maxDate: Field;
    };
};
export declare class DateStruct extends DateStruct_base {
    constructor(birthday: Field, minDate: Field, maxDate: Field);
    check(): void;
    _assert(expr: unknown, msg?: string): void;
}
export {};
