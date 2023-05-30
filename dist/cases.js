"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Square = exports.Benchmark = exports.Vaccine = void 0;
const zod_1 = require("zod");
exports.Vaccine = zod_1.z.object({
    // issuer id number
    issuer: zod_1.z.number().positive(),
    // timestamp of expiration
    expiration: zod_1.z.number().positive(),
}).describe("Vaccine schema");
exports.Benchmark = zod_1.z.object({
    a: zod_1.z.number().positive(),
    b: zod_1.z.boolean(),
    c: zod_1.z.string().min(4).max(40),
    d: zod_1.z.date().max(new Date(2029, 12, 31)),
    e: zod_1.z.number().min(0).max(100),
    f: zod_1.z.number().lt(0),
    g: zod_1.z.number().gt(0),
    h: zod_1.z.number().lte(0),
    i: zod_1.z.number().gte(0),
}).describe('Benchmark schema definitions');
exports.Square = zod_1.z.object({
    num: zod_1.z.number().positive()
});
