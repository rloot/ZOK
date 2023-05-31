import { z } from "zod";
import * as fs from "fs";
import { zodToJsonSchema } from "zod-to-json-schema";
import { JsonSchema7NumberType } from "zod-to-json-schema/src/parsers/number";
import { JsonSchema7StringType } from "zod-to-json-schema/src/parsers/string";
import ts, { ObjectLiteralElementLike } from "typescript";

import { Vaccine, Benchmark, Square } from "./cases"

const vaccineJson = zodToJsonSchema(Vaccine, "vaccine");
const benchmarkJson = zodToJsonSchema(Benchmark, "Benchmark");
const square = zodToJsonSchema(Square, "Square");

// console.log(jsonSchema.definitions);
const { definitions } = square

if (definitions === undefined) {

} else {
  for (const entity of Object.keys(definitions)) {
    console.log('create entity', entity)
    createEntity(entity, definitions);
  }
}

function createThrow() {
  return ts.factory.createThrowStatement(
    ts.factory.createNewExpression(
      ts.factory.createIdentifier("Error"),
      undefined,
      [ts.factory.createIdentifier("msg")]
    )
  );
}

function createAssertFunction() {
  return ts.factory.createMethodDeclaration(
    [
      ts.factory.createModifier(ts.SyntaxKind.PublicKeyword),
    ],
    undefined,
    "_assert",
    undefined,
    undefined,
    [
      ts.factory.createParameterDeclaration(
        undefined,
        undefined,
        ts.factory.createIdentifier("expr"),
        undefined,
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
      ),
      ts.factory.createParameterDeclaration(
        undefined,
        undefined,
        ts.factory.createIdentifier("msg"),
        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
      ),
    ],
    undefined,
    ts.factory.createBlock(
      [
        ts.factory.createIfStatement(
          ts.factory.createPrefixUnaryExpression(
            ts.SyntaxKind.ExclamationToken,
            ts.factory.createIdentifier("expr")
          ),
          ts.factory.createThrowStatement(
            ts.factory.createNewExpression(
              ts.factory.createIdentifier("Error"),
              undefined,
              [ts.factory.createIdentifier("msg")]
            )
          ),
          undefined
        ),
      ],
      true
    )
  );
  // ts.factory.createExpressionStatement(ts.factory.createIdentifier('expr')),
}

function createCheckFunction(entity: any) {
  const { properties } = entity;

  const parameters: ts.ParameterDeclaration[] = [];
  const statements: ts.Statement[] = [];

  // console.log('properties', properties)
  for (const key of Object.keys(properties)) {

    console.log('property name', key)
    const property = properties[key];
    
    if (property === undefined) continue;
    
    const { type } = property;
    console.log(type)

    function _getAssertCallStatement(expr: ts.Expression, message: ts.Expression): ts.Statement {
      return ts.factory.createCallExpression(
        ts.factory.createIdentifier(`this._assert`),
        undefined,
        [expr, message]
      ) as unknown as ts.Statement
    }

    function _getMinimumValueAssert(min: number): ts.Statement {
      const binaryExpr = ts.factory.createBinaryExpression(
        ts.factory.createIdentifier(`this.${key}`),
        ts.factory.createToken(ts.SyntaxKind.GreaterThanToken),
        ts.factory.createNumericLiteral(min.toString())
      );
      const call = ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
          ts.factory.createIdentifier(`this.${key}`),
          ts.factory.createIdentifier('greaterThan')
        ),
        undefined,
        [ts.factory.createNumericLiteral(min)]
      )
      const message = ts.factory.createStringLiteral(
        `${key} must be greater than ${min}`
      );
      return _getAssertCallStatement(call, message)
    }
    
    function _getExclusiveMinimumValueAssert(min: number): ts.Statement {
      const callExpr = ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
          ts.factory.createIdentifier(`this.${key}`),
          ts.factory.createIdentifier('greaterThanOrEqual')
        ),
        undefined,
        [ts.factory.createNumericLiteral(min)]
      )
      const message = ts.factory.createStringLiteral(
        `${key} must be greater or equal than ${min}`
      );
      return _getAssertCallStatement(callExpr, message)
    }

    function _getMaximumValueAssert(max: number): ts.Statement {
      const callExpr = ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
          ts.factory.createIdentifier(`this.${key}`),
          ts.factory.createIdentifier('greaterThanOrEqual')
        ),
        undefined,
        [ts.factory.createNumericLiteral(max)]
      )
      const message = ts.factory.createStringLiteral(
        `${key} must be less than ${max}`
        );
      return _getAssertCallStatement(callExpr, message)
    }
    function _getExclusiveMaximumValueAssert(max: number): ts.Statement {
      const callExpr = ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
          ts.factory.createIdentifier(`this.${key}`),
          ts.factory.createIdentifier('lessThanOrEqual')
        ),
        undefined,
        [ts.factory.createNumericLiteral(max)]
      )
      const message = ts.factory.createStringLiteral(
        `${key} must be less or equal than ${max}`
        );
      return _getAssertCallStatement(callExpr, message)
    }

    function _getBooleanAsserts(property: any): ts.Statement[] {
      const statements: ts.Statement[] = [];

      return statements;
    }

    function createSingleLineComment(text: string) {
      return ts.factory.createIdentifier(
        '// '.concat(text)
      ) as unknown as ts.Statement
    }

    function _getNumberAsserts(property: JsonSchema7NumberType): ts.Statement[] {
      const statements: ts.Statement[] = [];

      if (property.minimum !== undefined) {

        statements.push(_getMinimumValueAssert(property.minimum));
      }
      if (property.exclusiveMinimum !== undefined) {
        statements.push(createSingleLineComment('exclusive minimum'))
        statements.push(_getExclusiveMinimumValueAssert(property.exclusiveMinimum));
      }
      if (property.maximum !== undefined) {
        statements.push(_getMaximumValueAssert(property.maximum));
      }
      if (property.exclusiveMaximum !== undefined) {
        statements.push(_getExclusiveMaximumValueAssert(property.exclusiveMaximum));
      }
      if (property.multipleOf !== undefined) {
      }
      return statements;
    }

    function _getStringAsserts(
      property: JsonSchema7StringType
    ): ts.Statement[] {
      const statements: ts.Statement[] = [];
      return statements;
    }

    console.log(property)
    switch (type) {
      case "string":
        statements.push(..._getStringAsserts(property));
      case "number":
        statements.push(..._getNumberAsserts(property));
      case "boolean":
        statements.push(..._getBooleanAsserts(property));
    }
  }

  const checkFn = ts.factory.createMethodDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.PublicKeyword)],
    undefined,
    "check",
    undefined,
    undefined,
    parameters,
    undefined,
    ts.factory.createBlock(statements, true)
  );

  return checkFn;
}

function createImportStaments() {
  const names = ts.factory.createNamedImports([
    ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('Field')),
    ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('SmartContract')),
    ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('state')),
    ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('State')),
    ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('method')),
    ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('Poseidon')),
    ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('Bool')),
    ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('Struct'))
  ])

  return ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(false, undefined, names),
    ts.factory.createStringLiteral('snarkyjs')
  )
}

function getProperties(properties: any[]) {
  return Object.keys(properties).map((key) => {
    return ts.factory.createPropertyAssignment(
      key,
      ts.factory.createIdentifier('Field'),
    ) as unknown as ObjectLiteralElementLike;
  })
}

function createClass(entity: any) {
  const { properties } = entity;
  console.log(entity)
  const props = getProperties(properties)
  const assertFn = createAssertFunction();
  const checkFn = createCheckFunction(entity);
    
  const members = [
    checkFn,
    assertFn
  ];

  return ts.factory.createClassDeclaration(
    [
      ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)
    ],
    "Square",
    undefined,
    [
      ts.factory.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
        ts.factory.createExpressionWithTypeArguments(
          ts.factory.createCallExpression(
            ts.factory.createIdentifier('Struct'),
            undefined,
            [
              ts.factory.createObjectLiteralExpression(
                props, 
                true
              )
            ]
          ),
          undefined
        )
      ])
    ],
    members
  );

}

function createEntity(name: string, definitions: any) {
  
  const entity = definitions[name];
  const { properties } = entity;
  
  // const parameters: ts.ParameterDeclaration[] = [];
   
  const imports: ts.ImportDeclaration[] = [createImportStaments()];

  const clazz = createClass(entity)

  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
  });

  const sf = ts.factory.createSourceFile(
    [...imports, clazz],
    ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None
  )
  const source = printer.printFile(sf)

  fs.writeFileSync('./src/structs.ts', source)
}
