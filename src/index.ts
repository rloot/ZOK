#!/usr/bin/env node
import { zodToJsonSchema } from "zod-to-json-schema";
import * as cases from "./cases"
import { ZodObject } from "zod";
import { createEntity } from "./codegen";

export function generate(filename: string, schema: ZodObject<any>) {
  // use the right name
  const json = zodToJsonSchema(schema, { name: filename, dateStrategy: 'integer' })

  const { definitions } = json

  console.log(definitions);

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

if (flags.length > 1) {
  if(!name) {
    throw new Error('No name provided');
  }
  
  if(!requestedCase) {
    throw new Error('No case');
  }
  generate(name, cases[requestedCase])
  
} else {
  for (const key in cases) {
    if (Object.hasOwnProperty.call(cases, key)) {
      const schema = cases[key];
      generate(key, schema)
    }
  }
}

