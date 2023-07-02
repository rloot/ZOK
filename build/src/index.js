#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { zodToJsonSchema } from "zod-to-json-schema";
import { createEntity } from "./codegen.js";
export function generate(filename, schema) {
    // use the right name
    const json = zodToJsonSchema(schema, { name: filename, dateStrategy: 'integer' });
    const { definitions } = json;
    if (definitions === undefined) {
        throw Error('undefined definitions');
    }
    else {
        for (const entity of Object.keys(definitions)) {
            createEntity(entity, definitions);
        }
    }
}
const init = () => {
    // create schemas file with example
    // build root folder
    //  run zok
};
const processSchemas = (specifiedCasesPath, requestedCase) => {
    const defaultCasesPath = 'build/src/schemas.js';
    let casesPath;
    if (specifiedCasesPath) {
        const filename = path.basename(specifiedCasesPath); // 'mytcfile.ts' 
        const buildDirectory = 'build/src/';
        const buildFilePath = path.join(buildDirectory, filename.replace(/\.ts$/, '.js'));
        casesPath = buildFilePath;
    }
    else {
        casesPath = defaultCasesPath;
    }
    const casesPathWithBaseDirectory = path.join(process.cwd(), casesPath);
    if (!fs.existsSync(casesPathWithBaseDirectory)) {
        throw new Error('Cases path does not exist');
    }
    import(casesPathWithBaseDirectory)
        .then(cases => {
        let generatedStructs = [];
        if (requestedCase) {
            const schema = cases[requestedCase];
            generate(requestedCase, schema);
            generatedStructs.push(requestedCase);
        }
        else {
            for (const key in cases) {
                if (Object.hasOwnProperty.call(cases, key)) {
                    const schema = cases[key];
                    generate(key, schema);
                    generatedStructs.push(key);
                }
            }
        }
        console.log('Generated structs: \n');
        generatedStructs.forEach(struct => {
            console.log(`${struct}`);
        });
        console.log(`\nAt path ${casesPathWithBaseDirectory}\n`);
    });
};
const main = () => {
    const flags = process.argv.slice(2);
    if (flags[0] == 'init') {
        console.log('hi >');
    }
    else {
        const specifiedCasesPath = flags[0];
        const requestedCase = flags[1];
        processSchemas(specifiedCasesPath, requestedCase);
    }
};
main();
//# sourceMappingURL=index.js.map