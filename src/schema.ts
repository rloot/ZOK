import { z } from 'zod';

export const SquareStruct = z.object({
  num: z.number().gte(1),
});

export const VaccineStruct = z
  .object({
    // issuer id number
    issuer: z.number().positive(),
    // timestamp of expiration
    expiration: z.number().positive(),
  })
  .describe('Vaccine schema');

export const Square = z.object({
  num: z.number().gte(0),
});

export const FieldStruct = z
  .object({
    f: z.number().lt(10),
    g: z.number().gt(0),
    h: z.number().lte(5),
    i: z.number().gte(0),
  })
  .describe('Benchmark schema definitions');

export const BoolStruct = z.object({
  boolean1: z.boolean(),
});

export const DateStruct = z.object({
  birthday: z.date(),
  minDate: z.date().min(new Date('1970-01-02')),
  maxDate: z.date().max(new Date('1972-01-02')),
});
