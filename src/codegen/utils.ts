import * as fs from "fs";
import { JsonSchema7NumberType } from "zod-to-json-schema/src/parsers/number";
import { JsonSchema7StringType } from "zod-to-json-schema/src/parsers/string";
import { JsonSchema7DateType } from "zod-to-json-schema/src/parsers/date";
import ts, { ObjectLiteralElementLike } from "typescript";

import { getStorageLayout, pack } from "./properties.js";
import { Slot, SlotValue, StorageLayout } from "../types.js";

const factory = ts.factory;

const NO_MODIFIERS: ts.Modifier[] = [];

const NO_ASTERISK = undefined;
const NO_QUESTION_TOKEN = undefined;
const NO_TYPED_PARAMS = undefined;
const NO_TYPED_NODE = undefined;

// utils

export function getPropertyMapping(properties: any[]): any {
  const propertyMapping: any = {};
  let bitsize = 0;
  for (const key in properties) {
    const property = properties[key];
    propertyMapping[key] = Math.floor(bitsize / 256);
    // fixme: this assumes every property is uint64
    bitsize += 64;
  }
  return propertyMapping;
}

export function createSingleLineComment(text: string) {
  return (ts.factory.createIdentifier(`// ${text}`) as unknown) as ts.Statement;
}