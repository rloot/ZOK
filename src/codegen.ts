import * as fs from "fs";
import { JsonSchema7NumberType } from "zod-to-json-schema/src/parsers/number";
import { JsonSchema7StringType } from "zod-to-json-schema/src/parsers/string";
import { JsonSchema7DateType } from "zod-to-json-schema/src/parsers/date";
import ts, { ObjectLiteralElementLike } from "typescript";


const NO_MODIFIERS: ts.Modifier[] = [];
const NO_ASTERISK: ts.AsteriskToken = undefined;
const NO_QUESTION_TOKEN = undefined
const NO_TYPED_PARAMS = undefined
const NO_TYPED_NODE = undefined

function _getTypeFromPropKey(key: string) {
  return  key == 'boolean' ? 'Bool':'Field'
}

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

// property asserts

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

// utils

function getProperties(properties: any[]) {
  return Object.keys(properties).map((key) => {
    const type = properties[key]?.type;
    return ts.factory.createPropertyAssignment(
      key,
      ts.factory.createIdentifier(_getTypeFromPropKey(type)),
    ) as unknown as ObjectLiteralElementLike;
  })
}

function createSingleLineComment(text: string) {
  return (ts.factory.createIdentifier(
    `// ${text}`
  ) as unknown) as ts.Statement;
}

// declarations

function createClass(name: string, entity: any) {
  const { properties } = entity;

  const props = getProperties(properties)
  const assertFn = createAssertFunction();
  const checkFn = createCheckFunction(entity);
  const constructorFn = createConstructorFunction(entity);    

  const members = [
    constructorFn,
    checkFn,
    assertFn,
  ];

  return ts.factory.createClassDeclaration(
    [
      ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)
    ],
    name,
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



function createConstructorFunction(entity) {
  const { properties } = entity;
  
  const props = Object.keys(properties).map(name => name)
  
  // constructor params
  const parameters = props.map((key) => {
    const type = properties[key]?.type;
  
    return ts.factory.createParameterDeclaration(
      undefined,
      undefined,
      ts.factory.createIdentifier(key),
      undefined,
      ts.factory.createTypeReferenceNode(
        // todo : this should be the correct type, for now we always return Field 
        ts.factory.createIdentifier(_getTypeFromPropKey(type)), undefined
      ),
    )
  })
 
  const superCall = ts.factory.createExpressionStatement(
    ts.factory.createCallExpression(
      ts.factory.createSuper(),
      undefined,
      [
      ts.factory.createObjectLiteralExpression(
        props.map(key => { 
          return ts.factory.createShorthandPropertyAssignment(
            ts.factory.createIdentifier(key),
            undefined // uninitalized
           )
        })
      )
    ])
  )

  const checkCall = ts.factory.createExpressionStatement(
      ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
          ts.factory.createThis(),
          ts.factory.createIdentifier('check')
        ),
        undefined,
        []
      )
  )
  
  const statements = [superCall, checkCall]

  const fn = ts.factory.createConstructorDeclaration(
    undefined,
    parameters,
    ts.factory.createBlock(
      statements, true
    ),
  )
  return fn
}

function _getCheckStatement(propertyName: string, property: any) {
  const { type, format } = property;
  const statements: ts.Statement[] = [];

  switch (type) {
      case "string":
       statements.push(..._getStringAsserts(propertyName, property));
      break;
    case "integer":
      if (format === 'unix-time') {
        statements.push(..._getDateAsserts(propertyName, property));
      }
      break;
    case "number":
      statements.push(..._getNumberAsserts(propertyName, property));
      break;
    case "boolean":
      statements.push(..._getBooleanAsserts(propertyName, property));
      break;
  }
  return statements
}

function createCheckFunction(entity: any) {
  const { properties } = entity;

  const parameters: ts.ParameterDeclaration[] = [];

  const statements: ts.Statement[] = Object.entries(properties).map(
    ([name, property]) => _getCheckStatement(name, property)
  ).flat();
 
  const checkFn = ts.factory.createMethodDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.PublicKeyword)],
    NO_ASTERISK,
    "check",
    NO_QUESTION_TOKEN,
    NO_TYPED_PARAMS,
    parameters,
    NO_TYPED_NODE,
    ts.factory.createBlock(statements, true)
  );

  return checkFn;
}


function createAssertFunction() {
  return ts.factory.createMethodDeclaration(
    NO_MODIFIERS,
    NO_ASTERISK,
    "_assert",
    NO_QUESTION_TOKEN,
    NO_TYPED_PARAMS,
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
    NO_TYPED_NODE,
    ts.factory.createBlock(
      [
        // if (!expr) 
        ts.factory.createIfStatement(
          ts.factory.createPrefixUnaryExpression(
            ts.SyntaxKind.ExclamationToken,
            ts.factory.createIdentifier("expr")
          ),
          // throw new Error(msg)
          ts.factory.createThrowStatement(
            ts.factory.createNewExpression(
              ts.factory.createIdentifier("Error"),
              undefined,
              [ts.factory.createIdentifier("msg")]
            )
          ),
          // no else
          undefined
        ),
      ],
      false
    )
  );
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

export function createEntity(name: string, definitions: any) {
  
  const entity = definitions[name];
  const { properties } = entity;
     
  // single line import statement
  const imports: ts.ImportDeclaration[] = [createImportStaments()];

  // create class definitoin
  const clazz = createClass(name, entity)

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
  if (!fs.existsSync('./src/structs')) fs.mkdirSync('./src/structs')
  // write created struct to file
  fs.writeFileSync(`./src/structs/${name}.ts`, source)
}

