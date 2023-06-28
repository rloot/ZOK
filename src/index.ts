#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { zodToJsonSchema } from "zod-to-json-schema";

import { ZodObject } from "zod";
import { createEntity } from "./codegen";

export function generate(filename: string, schema: ZodObject<any>) {
  // use the right name
  const json = zodToJsonSchema(schema, { name: filename, dateStrategy: 'integer' })

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

let casesPath = 'dist/cases.js'
const flags = process.argv.slice(2);
const specifiedCasesPath = flags[0];
const requestedCase = flags[1];

if(specifiedCasesPath) {
  casesPath = specifiedCasesPath;
}

if (!fs.existsSync(casesPath)) {
  throw new Error('Cases path does not exist');
}

const url = path.resolve(casesPath);
const cases = require(url);

if(requestedCase) {
  const schema = cases[requestedCase];
  generate(requestedCase, schema)
} else {
  for (const key in cases) {
    if (Object.hasOwnProperty.call(cases, key)) {
      const schema = cases[key];
      generate(key, schema)
    }
  }
}
