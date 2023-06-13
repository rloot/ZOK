import { z } from "zod";

export const Vaccine = z.object({
    // issuer id number
    issuer: z.number().positive(),
    // timestamp of expiration
    expiration: z.number().positive(),
}).describe("Vaccine schema");

export const Square = z.object({
  num: z.number().gte(0)
});

export const FieldStruct = z.object({
    c: z.string().min(4).max(40),
    e: z.number().min(0).max(100),
    f: z.number().lt(0),
    g: z.number().gt(0),
    h: z.number().lte(0),
    i: z.number().gte(0),
}).describe('Benchmark schema definitions')

export const BoolStruct = z.object({
  boolean1: z.boolean()
});