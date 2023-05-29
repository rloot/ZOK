import { JsonSchema7NumberType } from "zod-to-json-schema/src/parsers/number";
import { JsonSchema7StringType } from "zod-to-json-schema/src/parsers/string";
import ts from "typescript";


export function _getAssertCallStatement(
  expr: ts.Expression,
  message: ts.Expression
): ts.Statement {
  return (ts.factory.createCallExpression(
    ts.factory.createIdentifier(`this._assert`),
    undefined,
    [expr, message]
  ) as unknown) as ts.Statement;
}

export function _getMinimumValueAssert(
  propertyName: string,
  min: number
): ts.Statement {
  const binaryExpr = ts.factory.createBinaryExpression(
    ts.factory.createIdentifier(`this.${propertyName}`),
    ts.factory.createToken(ts.SyntaxKind.GreaterThanToken),
    ts.factory.createNumericLiteral(min.toString())
  );
  const call = ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(
      ts.factory.createIdentifier(`this.${propertyName}`),
      ts.factory.createIdentifier("greaterThan")
    ),
    undefined,
    [ts.factory.createNumericLiteral(min)]
  );
  const message = ts.factory.createStringLiteral(
    `${propertyName} must be greater than ${min}`
  );
  return _getAssertCallStatement(call, message);
}

export function _getExclusiveMinimumValueAssert(
  propertyName: string,
  min: number
): ts.Statement {
  const callExpr = ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(
      ts.factory.createIdentifier(`this.${propertyName}`),
      ts.factory.createIdentifier("greaterThanOrEqual")
    ),
    undefined,
    [ts.factory.createNumericLiteral(min)]
  );
  const message = ts.factory.createStringLiteral(
    `${propertyName} must be greater or equal than ${min}`
  );
  return _getAssertCallStatement(callExpr, message);
}

export function _getMaximumValueAssert(
  propertyName: string,
  max: number
): ts.Statement {
  const callExpr = ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(
      ts.factory.createIdentifier(`this.${propertyName}`),
      ts.factory.createIdentifier("greaterThanOrEqual")
    ),
    undefined,
    [ts.factory.createNumericLiteral(max)]
  );
  const message = ts.factory.createStringLiteral(
    `${propertyName} must be less than ${max}`
  );
  return _getAssertCallStatement(callExpr, message);
}

export function _getExclusiveMaximumValueAssert(
  propertyName: string,
  max: number
): ts.Statement {
  const callExpr = ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(
      ts.factory.createIdentifier(`this.${propertyName}`),
      ts.factory.createIdentifier("lessThanOrEqual")
    ),
    undefined,
    [ts.factory.createNumericLiteral(max)]
  );
  const message = ts.factory.createStringLiteral(
    `${propertyName} must be less or equal than ${max}`
  );
  return _getAssertCallStatement(callExpr, message);
}

export function _getBooleanAsserts(
  propertyName: string,
  property: any
): ts.Statement[] {
  const statements: ts.Statement[] = [];

  return statements;
}

export function createSingleLineComment(text: string) {
  return (ts.factory.createIdentifier(
    `// ${text}`
  ) as unknown) as ts.Statement;
}

export function _getNumberAsserts(
  propertyName: string,
  property: JsonSchema7NumberType
): ts.Statement[] {
  const statements: ts.Statement[] = [];

  if (property.minimum !== undefined) {
    statements.push(_getMinimumValueAssert(propertyName, property.minimum));
  }
  if (property.exclusiveMinimum !== undefined) {
    statements.push(createSingleLineComment("exclusive minimum"));
    statements.push(
      _getExclusiveMinimumValueAssert(propertyName, property.exclusiveMinimum)
    );
  }
  if (property.maximum !== undefined) {
    statements.push(_getMaximumValueAssert(propertyName, property.maximum));
  }
  if (property.exclusiveMaximum !== undefined) {
    statements.push(
      _getExclusiveMaximumValueAssert(propertyName, property.exclusiveMaximum)
    );
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
