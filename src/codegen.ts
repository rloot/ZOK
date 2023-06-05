import * as fs from "fs";
import { JsonSchema7NumberType } from "zod-to-json-schema/src/parsers/number";
import { JsonSchema7StringType } from "zod-to-json-schema/src/parsers/string";
import ts, { ObjectLiteralElementLike } from "typescript";


function _getAssertCallStatement(
  expr: ts.Expression,
  message: ts.Expression
): ts.Statement {
  return (ts.factory.createCallExpression(
    ts.factory.createIdentifier(`this._assert`),
    undefined,
    [expr, message]
  ) as unknown) as ts.Statement;
}

function _gtAssert(
  propertyName: string,
  min: number
): ts.Statement {

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
    undefined,
    [
      ts.factory.createNumericLiteral(min),
      message
    ]
  );
  return (callExpr as unknown) as ts.Statement;
}

function _gteAssert(
  propertyName: string,
  min: number
): ts.Statement {
  const message = ts.factory.createStringLiteral(
    `${propertyName} must be greater or equal than ${min}`
  );

  const callExpr = ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(
      ts.factory.createIdentifier(`this.${propertyName}`),
      ts.factory.createIdentifier("assertGreaterThanOrEqual")
    ),
    undefined,
    [
      ts.factory.createNumericLiteral(min),
      message
    ]
  );
  return (callExpr as unknown) as ts.Statement;
}

function _ltAssert(
  propertyName: string,
  max: number
): ts.Statement {

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
    undefined,
    [
      ts.factory.createNumericLiteral(max),
      message    
    ]
  );
  return (callExpr as unknown) as ts.Statement;
}

function _lteAssert(
  propertyName: string,
  max: number
): ts.Statement {

  const message = ts.factory.createStringLiteral(
    `${propertyName} must be less or equal than ${max}`
  );
  
  const callExpr = ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(
      ts.factory.createIdentifier(`this.${propertyName}`),
      ts.factory.createIdentifier("assertLessThanOrEqual")
    ),
    undefined,
    [
      ts.factory.createNumericLiteral(max),
      message
    ]
  );
  return (callExpr as unknown) as ts.Statement;
}

function _getBooleanAsserts(
  propertyName: string,
  property: any
): ts.Statement[] {
  const statements: ts.Statement[] = [];

  return statements;
}

function createSingleLineComment(text: string) {
  return (ts.factory.createIdentifier(
    `// ${text}`
  ) as unknown) as ts.Statement;
}

function _getNumberAsserts(
  propertyName: string,
  property: JsonSchema7NumberType
): ts.Statement[] {
  const statements: ts.Statement[] = [];

  if (property.minimum !== undefined) {
    statements.push(_gteAssert(propertyName, property.minimum));
  }
  if (property.exclusiveMinimum !== undefined) {
    statements.push(createSingleLineComment("exclusive minimum"));
    statements.push(
      _gtAssert(propertyName, property.exclusiveMinimum)
    );
  }
  if (property.maximum !== undefined) {
    statements.push(_lteAssert(propertyName, property.maximum));
  }
  if (property.exclusiveMaximum !== undefined) {
    statements.push(
      _ltAssert(propertyName, property.exclusiveMaximum)
    );
  }
  if (property.multipleOf !== undefined) {
  }
  return statements;
}

function _getStringAsserts(
  propertyName: string,
  property: JsonSchema7StringType
): ts.Statement[] {
  const statements: ts.Statement[] = [];
  return statements;
}
function _getDateAsserts(
  propertyName: string,
  property: JsonSchema7StringType
): ts.Statement[] {
  const statements: ts.Statement[] = [];
  console.log(propertyName, property)
  return statements;
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

function _getCheckStatement(propertyName: string, property: any) {
  const { type, format } = property;
  const statements: ts.Statement[] = [];
  switch (type) {
    case "string":
      if (format === 'date-time') {
        statements.push(..._getDateAsserts(propertyName, property));
      } else {
        statements.push(..._getStringAsserts(propertyName, property));
      }
    case "number":
      statements.push(..._getNumberAsserts(propertyName, property));
    case "boolean":
      statements.push(..._getBooleanAsserts(propertyName, property));
  }
  return statements
}

function createCheckFunction(entity: any) {
  const { properties } = entity;

  const parameters: ts.ParameterDeclaration[] = [];
  //  = [];

  // console.log('properties', properties)
  console.log(entity)

  const statements: ts.Statement[] = Object.entries(properties).map(
    ([name, property]) => _getCheckStatement(name, property)
  ).flat();
 
  for (const key of Object.keys(properties)) {
    console.log('property name', key)
    const property = properties[key];
    
    if (property === undefined) continue;
    

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


export function createAssertFunction() {
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

export function createImportStaments() {
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

export function createEntity(name: string, definitions: any) {
  
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

