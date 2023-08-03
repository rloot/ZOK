import { JsonSchema7NumberType } from "zod-to-json-schema/src/parsers/number";
import { JsonSchema7StringType } from "zod-to-json-schema/src/parsers/string";
import { JsonSchema7DateType } from "zod-to-json-schema/src/parsers/date";
import ts, { ObjectLiteralElementLike } from "typescript";
import { createSingleLineComment } from "./utils.js";
const factory = ts.factory;

const NO_MODIFIERS: ts.Modifier[] = [];

const NO_ASTERISK = undefined;
const NO_QUESTION_TOKEN = undefined;
const NO_TYPED_PARAMS = undefined;
const NO_TYPED_NODE = undefined;

export function _getAssertCallStatement(
    expr: ts.Expression,
    message: ts.Expression
  ): ts.Statement {
    return (ts.factory.createCallExpression(
      ts.factory.createIdentifier(`this._assert`),
      NO_TYPED_NODE,
      [expr, message]
    ) as unknown) as ts.Statement;
  }
  
  // property asserts
  
export function _gtAssert(propertyName: string, min: number): ts.Statement {
    const binaryExpr = ts.factory.createBinaryExpression(
      ts.factory.createIdentifier(`this.${propertyName}`),
      ts.factory.createToken(ts.SyntaxKind.GreaterThanToken),
      ts.factory.createNumericLiteral(min.toString())
    );
    const message = ts.factory.createStringLiteral(
      `${propertyName} must be greater than ${min}`
    );
    const callExpr = ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier(`this.${propertyName}`),
        ts.factory.createIdentifier("assertGreaterThan")
      ),
      NO_TYPED_NODE,
      [ts.factory.createNumericLiteral(min), message]
    );
    return (callExpr as unknown) as ts.Statement;
  }
  
  export function _gteAssert(propertyName: string, min: number): ts.Statement {
    const message = ts.factory.createStringLiteral(
      `${propertyName} must be greater or equal than ${min}`
    );
  
    const callExpr = ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier(`this.${propertyName}`),
        ts.factory.createIdentifier("assertGreaterThanOrEqual")
      ),
      NO_TYPED_NODE,
      [ts.factory.createNumericLiteral(min), message]
    );
    return (callExpr as unknown) as ts.Statement;
  }
  
  export function _ltAssert(propertyName: string, max: number): ts.Statement {
    // if (max < 0) {
    //   throw new Error('numbers in MINA cannot go below zero')
    // }
  
    const message = ts.factory.createStringLiteral(
      `${propertyName} must be less than ${max}`
    );
    const callExpr = ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier(`this.${propertyName}`),
        ts.factory.createIdentifier("assertLessThan")
      ),
      NO_TYPED_NODE,
      [ts.factory.createNumericLiteral(max), message]
    );
    return (callExpr as unknown) as ts.Statement;
  }
  
  export function _lteAssert(propertyName: string, max: number): ts.Statement {
    const message = ts.factory.createStringLiteral(
      `${propertyName} must be less or equal than ${max}`
    );
  
    const callExpr = ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier(`this.${propertyName}`),
        ts.factory.createIdentifier("assertLessThanOrEqual")
      ),
      NO_TYPED_NODE,
      [ts.factory.createNumericLiteral(max), message]
    );
    return (callExpr as unknown) as ts.Statement;
  }
  
  export function _getBooleanAsserts(
    propertyName: string,
    property: any
  ): ts.Statement[] {
    const statements: ts.Statement[] = [];
  
    return statements;
  }
  
  export function _getNumberAsserts(
    propertyName: string,
    property: JsonSchema7NumberType
  ): ts.Statement[] {
    const statements: ts.Statement[] = [];
  
    if (property.minimum !== undefined) {
      statements.push(_gteAssert(propertyName, property.minimum));
    }
    if (property.exclusiveMinimum !== undefined) {
      statements.push(createSingleLineComment("exclusive minimum"));
      statements.push(_gtAssert(propertyName, property.exclusiveMinimum));
    }
    if (property.maximum !== undefined) {
      statements.push(_lteAssert(propertyName, property.maximum));
    }
    if (property.exclusiveMaximum !== undefined) {
      statements.push(_ltAssert(propertyName, property.exclusiveMaximum));
    }
    if (property.multipleOf !== undefined) {
    }
    return statements;
  }
  
  export function _getStringAsserts(
    propertyName: string,
    property: JsonSchema7StringType
  ): ts.Statement[] {
    const statements: ts.Statement[] = [];
    return statements;
  }
  
  export function _getDateAsserts(
    propertyName: string,
    property: JsonSchema7DateType
  ): ts.Statement[] {
    const statements: ts.Statement[] = [];
  
    if (property.minimum !== undefined) {
      statements.push(_gteAssert(propertyName, property.minimum));
    }
  
    if (property.maximum !== undefined) {
      statements.push(_lteAssert(propertyName, property.maximum));
    }
  
    return statements;
  }