import { z } from "zod";

export const Vaccine = z.object({
    // issuer id number
    issuer: z.number().positive(),
    // timestamp of expiration
    expiration: z.number().positive(),
}).describe("Vaccine schema");

export const Benchmark = z.object({
    a: z.number().positive(),
    b: z.boolean(),
    c: z.string().min(4).max(40),
    d: z.date().max(new Date(2029, 12, 31)),
    e: z.number().min(0).max(100),
    f: z.number().lt(0),
    g: z.number().gt(0),
    h: z.number().lte(0),
    i: z.number().gte(0),
}).describe('Benchmark schema definitions')

export const Square = z.object({
  num: z.number().positive()
});