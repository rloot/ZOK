import fs from 'fs';
import path from 'path';
import { zodToJsonSchema } from "zod-to-json-schema";
import { ZodObject } from "zod";
import { Command } from 'commander';
import { UInt240, read, set } from './lib/index.js';
import { createEntity } from "./codegen/index.js";

const processSchemas = async (
  // schemaFilepath?: string = './src/schemas.ts',
  schemaFilepath?: string,
  requestedCase?: string
) => {
  let casesPath: string;

  if (schemaFilepath !== undefined) {
    const filename = path.basename(schemaFilepath); // 'mytcfile.ts' 
    const buildDirectory = 'build/src';
    const buildFilePath = path.join(buildDirectory, filename);
  
    casesPath = buildFilePath;
  } else {
    casesPath = './src/schemas.js'
  }
  console.log(casesPath);
  const cwd = process.cwd();
  const casesPathWithBaseDirectory = path.join(cwd, casesPath);
  console.log(casesPathWithBaseDirectory, casesPath);

  if (!fs.existsSync(casesPathWithBaseDirectory)) {
    throw new Error('Cases path does not exist');
  }
  
  const schema = (await import(casesPathWithBaseDirectory))
  let generatedStructs: string[] = [];
  if(requestedCase) {
    generate(requestedCase,schema[requestedCase])
    generatedStructs.push(requestedCase);
  } else {
    Object.entries(schema).map(
      ([key, value]) => {
        generate(key, value as any)
        generatedStructs.push(key);
      }
    )
  }
  console.log('Generated structs: \n')
  generatedStructs.forEach(struct => {
    console.log(`${struct}`);
  });
  console.log(`\nAt path ${casesPathWithBaseDirectory}\n`);
}

export function generate(
  filename: string,
  schema: ZodObject<any>,
  packed: boolean = true
) {
  // use the right name
  const json = zodToJsonSchema(schema, filename);
  const { definitions } = json;
  if (definitions === undefined) {
    throw Error("undefined definitions");
  } else {
    for (const entity of Object.keys(definitions)) {
      const options = {
        packed
      }
      createEntity(entity, definitions, options);
    }
  }
}

const program = new Command();
program
  .command("generate")
  .description("generate code")
  .argument("name", "otuput struct name")
  .argument("schema", "schema file")
  .argument("entity", "selected case")
  .option("--packed", "pack variables flag")
  .action(async (name, schema, entity, options) => {
    console.log("generate", name, schema, options);
    await processSchemas(schema, entity)
  });

program.parse();

export { UInt240, read, set };