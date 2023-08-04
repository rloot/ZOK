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
  requestedCase?: string,
  options?: any
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

  const entities = requestedCase ? [requestedCase] : Object.keys(schema);

  entities.map((name: string) => generate(name, schema[name], options))

  console.log('Generated structs: \n')
  entities.forEach(name => console.log(`${name}`));
  console.log(`\nAt path ${casesPathWithBaseDirectory}\n`);
}

export function generate(
  filename: string,
  schema: ZodObject<any>,
  options: any
) {
  // use the right name
  const json = zodToJsonSchema(schema, filename);
  const { definitions } = json;
  if (definitions === undefined) {
    throw Error("undefined definitions");
  } else {
    for (const entity of Object.keys(definitions)) {
      console.log('options', options)
      createEntity(entity, definitions, options);
    }
  }
}

const program = new Command();
program.command("generate")
  .description("generate code")
  // .argument("name", "otuput struct name")
  .argument("<schema>", "schema file")
  .option("--entity <entity>", "a specific entity to generate")
  .option("--packed", "pack variables flag", false)
  .option("--accessors", "accessors flag", false)
  .action(async (schema, options) => {
    console.log("generate", schema, options);
    await processSchemas(
      schema,
      options.entity,
      {
        packed: options.packed,
        accessors: options.accessors
      }
    )
  });

program.parse();

export { UInt240, read, set };