#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { zodToJsonSchema } from "zod-to-json-schema";

import { ZodObject } from "zod";
import { createEntity } from "./codegen";
import { getRedirectStatus } from 'next/dist/lib/load-custom-routes';

export function generate(filename: string, schema: ZodObject<any>) {
  // use the right name
  const json = zodToJsonSchema(schema, { name: filename, dateStrategy: 'integer' })

  const { definitions } = json

  if (definitions === undefined) {
    throw Error('undefined definitions')
  } else {
    for (const entity of Object.keys(definitions)) {
      createEntity(entity, definitions);
    }
  }  
}

const defaultCasesPath = '/src/cases.ts'

const flags = process.argv.slice(2);
const specifiedCasesPath = flags[0];
const requestedCase = flags[1];

const casesPath = specifiedCasesPath || defaultCasesPath;
const casesPathWithBaseDirectory = path.join(process.cwd(), casesPath);

if (!fs.existsSync(casesPathWithBaseDirectory)) {
  throw new Error(`'Cases path ${casesPathWithBaseDirectory} does not exist`);
}

const cases = require(casesPathWithBaseDirectory);

let generatedStructs: string[] = [];

if(requestedCase) {
  const schema = cases[requestedCase];
  generate(requestedCase, schema)
  generatedStructs.push(requestedCase);
} else {
  for (const key in cases) {
    if (Object.hasOwnProperty.call(cases, key)) {
      const schema = cases[key];
      generate(key, schema)
      generatedStructs.push(key);
    }
  }
}


console.log('Generated structs: \n')
generatedStructs.forEach(struct => {
  console.log(`${struct}`);
});
console.log(`\nAt path ${casesPathWithBaseDirectory}\n`);

