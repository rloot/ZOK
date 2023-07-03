import { Field } from "snarkyjs";
declare const Vaccine_base: (new (value: {
    issuer: Field;
    expiration: Field;
}) => {
    issuer: Field;
    expiration: Field;
}) & {
    _isStruct: true;
} & import("snarkyjs/dist/node/snarky").ProvablePure<{
    issuer: Field;
    expiration: Field;
}> & {
    toInput: (x: {
        issuer: Field;
        expiration: Field;
    }) => {
        fields?: Field[];
        packed?: [Field, number][];
    };
    toJSON: (x: {
        issuer: Field;
        expiration: Field;
    }) => {
        issuer: string;
        expiration: string;
    };
    fromJSON: (x: {
        issuer: string;
        expiration: string;
    }) => {
        issuer: Field;
        expiration: Field;
    };
};
export declare class Vaccine extends Vaccine_base {
    constructor(issuer: Field, expiration: Field);
    check(): void;
    _assert(expr: unknown, msg?: string): void;
}
export {};
