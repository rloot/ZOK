#!/usr/bin/env node
import { zodToJsonSchema } from "zod-to-json-schema";

import * as cases from "./cases"
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

const flags = process.argv.slice(2);
const name = flags[0];
const requestedCase = flags[1];

if(!name) {
  throw new Error('No name provided');
}

if(!requestedCase) {
  throw new Error('No case');
}

generate(name, cases[requestedCase])
