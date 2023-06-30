"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateStruct = exports.BoolStruct = exports.FieldStruct = exports.Square = exports.Vaccine = void 0;
const zod_1 = require("zod");
exports.Vaccine = zod_1.z.object({
    // issuer id number
    issuer: zod_1.z.number().positive(),
    // timestamp of expiration
    expiration: zod_1.z.number().positive(),
}).describe("Vaccine schema");
exports.Square = zod_1.z.object({
    num: zod_1.z.number().gte(0)
});
exports.FieldStruct = zod_1.z.object({
    f: zod_1.z.number().lt(10),
    g: zod_1.z.number().gt(0),
    h: zod_1.z.number().lte(5),
    i: zod_1.z.number().gte(0),
}).describe('Benchmark schema definitions');
exports.BoolStruct = zod_1.z.object({
    boolean1: zod_1.z.boolean()
});
exports.DateStruct = zod_1.z.object({
    birthday: zod_1.z.date(),
    minDate: zod_1.z.date().min(new Date('1970-01-02')),
    maxDate: zod_1.z.date().max(new Date('1972-01-02')),
});
