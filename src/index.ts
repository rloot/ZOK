import * as fs from "fs";
import { zodToJsonSchema } from "zod-to-json-schema";
import ts, { ObjectLiteralElementLike } from "typescript";

import { Vaccine, FieldStruct, Square, BoolStruct } from "./cases"
import { ZodObject } from "zod";
import { createEntity } from "./codegen";

export function generate(filename: string, schema: ZodObject<any>) {
  // use the right name
  const json = zodToJsonSchema(schema, "BoolStruct")
  const { definitions } = json
  if (definitions === undefined) {
    throw Error('undefined definitions')
  } else {
    for (const entity of Object.keys(definitions)) {
      // console.log('create entity', entity)
      createEntity(entity, definitions);
    }
  }  
}
// const vaccineJson = zodToJsonSchema(Vaccine, "vaccine");
const benchmarkJson = zodToJsonSchema(BoolStruct, "BoolStruct");
generate('BoolStruct', BoolStruct)