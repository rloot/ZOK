#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const zod_to_json_schema_1 = require("zod-to-json-schema");
const codegen_1 = require("./codegen");
function generate(filename, schema) {
    // use the right name
    const json = (0, zod_to_json_schema_1.zodToJsonSchema)(schema, { name: filename, dateStrategy: 'integer' });
    const { definitions } = json;
    if (definitions === undefined) {
        throw Error('undefined definitions');
    }
    else {
        for (const entity of Object.keys(definitions)) {
            (0, codegen_1.createEntity)(entity, definitions);
        }
    }
}
exports.generate = generate;
const defaultCasesPath = 'build/src/cases.js';
const flags = process.argv.slice(2);
const specifiedCasesPath = flags[0];
const requestedCase = flags[1];
const casesPath = specifiedCasesPath || defaultCasesPath;
const casesPathWithBaseDirectory = path_1.default.join(process.cwd(), casesPath);
if (!fs_1.default.existsSync(casesPathWithBaseDirectory)) {
    throw new Error(`'Cases path ${casesPathWithBaseDirectory} does not exist`);
}
const cases = require(casesPathWithBaseDirectory);
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
