import { z } from 'zod';
export declare const SquareStruct: z.ZodObject<{
    num: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    num?: number;
}, {
    num?: number;
}>;
export declare const VaccineStruct: z.ZodObject<{
    issuer: z.ZodNumber;
    expiration: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    issuer?: number;
    expiration?: number;
}, {
    issuer?: number;
    expiration?: number;
}>;
export declare const Square: z.ZodObject<{
    num: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    num?: number;
}, {
    num?: number;
}>;
export declare const FieldStruct: z.ZodObject<{
    f: z.ZodNumber;
    g: z.ZodNumber;
    h: z.ZodNumber;
    i: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    f?: number;
    g?: number;
    h?: number;
    i?: number;
}, {
    f?: number;
    g?: number;
    h?: number;
    i?: number;
}>;
export declare const BoolStruct: z.ZodObject<{
    boolean1: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    boolean1?: boolean;
}, {
    boolean1?: boolean;
}>;
export declare const DateStruct: z.ZodObject<{
    birthday: z.ZodDate;
    minDate: z.ZodDate;
    maxDate: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    birthday?: Date;
    minDate?: Date;
    maxDate?: Date;
}, {
    birthday?: Date;
    minDate?: Date;
    maxDate?: Date;
}>;
