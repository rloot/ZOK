#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { zodToJsonSchema } from "zod-to-json-schema";

import { ZodObject } from "zod";
import { createEntity } from "./codegen.js";

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

const initializeZok = () => {
  // create schemas file with example

  // build root folder

  //  run zok
}

const processSchemas = (flags: string[]) => {
  const specifiedCasesPath = flags[0];
  const requestedCase = flags[1];
  
  const defaultCasesPath = 'build/src/schemas.js'
  let casesPath: string;

  if (specifiedCasesPath) {
    const filename = path.basename(specifiedCasesPath); // 'mytcfile.ts' 
    const buildDirectory = 'build/src/';
    const buildFilePath = path.join(buildDirectory, filename.replace(/\.ts$/, '.js'));
  
    casesPath = buildFilePath;
  } else {
    casesPath = defaultCasesPath
  }
  const casesPathWithBaseDirectory = path.join(process.cwd(), casesPath);
  
  if (!fs.existsSync(casesPathWithBaseDirectory)) {
    throw new Error('Cases path does not exist');
  }
  
  import(casesPathWithBaseDirectory)
    .then(cases => {
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
    });
}

const main = () => {
  
  const flags = process.argv.slice(2);

  switch(flags[0]) {
    case 'init':
      initializeZok();
      break;
    default:
      processSchemas(flags);
      break
  }
  if (flags[0] == 'init') {
    initializeZok();
  } else {

  }
}

main();

