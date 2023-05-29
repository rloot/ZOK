import * as fs from "fs";
import { zodToJsonSchema } from "zod-to-json-schema";
import ts, { ObjectLiteralElementLike } from "typescript";

import { Vaccine, Benchmark } from "./cases"
import { ZodObject } from "zod";
import { _getBooleanAsserts, _getNumberAsserts, _getStringAsserts } from "./codegen";


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

    console.log(property)
    switch (type) {
      case "string":
        statements.push(..._getStringAsserts(key, property));
      case "number":
        statements.push(..._getNumberAsserts(key, property));
      case "boolean":
        statements.push(..._getBooleanAsserts(key, property));
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
  // console.log(entity)
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
    "Vaccine",
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
     
  // single line import statement
  const imports: ts.ImportDeclaration[] = [createImportStaments()];

  // create class definitoin
  const clazz = createClass(entity)

  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
  });

  // create source file including imports and class definition
  const sf = ts.factory.createSourceFile(
    [...imports, clazz],
    ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None
  )
  const source = printer.printFile(sf)

  // if generated dir does not exist, create it
  if (!fs.existsSync('./src/generated')) fs.mkdirSync('./src/generated')
  // write created struct to file
  fs.writeFileSync(`./src/generated/${name}.ts`, source)
}


export function generate(filename: string, schema: ZodObject<any>) {
  // use the right name
  const json = zodToJsonSchema(schema, "Benchmark")
  const { definitions } = json
  if (definitions === undefined) {
    throw Error('undefined definitions')
  } else {
    for (const entity of Object.keys(definitions)) {
      // console.log('create entity', entity)
      createEntity(entity, definitions);
    }
  }  
}
// const vaccineJson = zodToJsonSchema(Vaccine, "vaccine");
const benchmarkJson = zodToJsonSchema(Benchmark, "Benchmark");
generate('benchmark', Benchmark)