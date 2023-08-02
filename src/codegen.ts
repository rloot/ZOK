import * as fs from "fs";
import { JsonSchema7NumberType } from "zod-to-json-schema/src/parsers/number";
import { JsonSchema7StringType } from "zod-to-json-schema/src/parsers/string";
import { JsonSchema7DateType } from "zod-to-json-schema/src/parsers/date";
import ts, { ObjectLiteralElementLike } from "typescript";

import { getStorageLayout, pack } from "./codegen/properties.js";
import { Slot, SlotValue, StorageLayout } from "./types";

const factory = ts.factory

const NO_MODIFIERS: ts.Modifier[] = [];
const NO_ASTERISK: ts.AsteriskToken = undefined;
const NO_QUESTION_TOKEN = undefined;
const NO_TYPED_PARAMS = undefined;
const NO_TYPED_NODE = undefined;

function _getTypeFromPropKey(key: string) {
  return key == 'boolean' ? 'Bool' : 'Field'
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

function _gtAssert(propertyName: string, min: number): ts.Statement {
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
    [ts.factory.createNumericLiteral(min), message]
  );
  return (callExpr as unknown) as ts.Statement;
}

function _gteAssert(propertyName: string, min: number): ts.Statement {
  const message = ts.factory.createStringLiteral(
    `${propertyName} must be greater or equal than ${min}`
  );

  const callExpr = ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(
      ts.factory.createIdentifier(`this.${propertyName}`),
      ts.factory.createIdentifier("assertGreaterThanOrEqual")
    ),
    undefined,
    [ts.factory.createNumericLiteral(min), message]
  );
  return (callExpr as unknown) as ts.Statement;
}

function _ltAssert(propertyName: string, max: number): ts.Statement {
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
    [ts.factory.createNumericLiteral(max), message]
  );
  return (callExpr as unknown) as ts.Statement;
}

function _lteAssert(propertyName: string, max: number): ts.Statement {
  const message = ts.factory.createStringLiteral(
    `${propertyName} must be less or equal than ${max}`
  );

  const callExpr = ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(
      ts.factory.createIdentifier(`this.${propertyName}`),
      ts.factory.createIdentifier("assertLessThanOrEqual")
    ),
    undefined,
    [ts.factory.createNumericLiteral(max), message]
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

function getPropertyMapping(properties: any[]) {
  const propertyMapping = {}
  let bitsize = 0  
  for (const key in properties) {
    const property = properties[key];
    propertyMapping[key] = Math.floor(bitsize / 256)
    // fixme: this assumes every property is uint64
    bitsize += 64
  }
  return propertyMapping
}

function getProperties(
  properties: {[key: string]: {type: string}},
  compact: boolean = true
) {
  if (!compact) {
    return Object.keys(properties).map((key) => {
      const type = properties[key]?.type;
      return (ts.factory.createPropertyAssignment(
        key,
        ts.factory.createIdentifier(_getTypeFromPropKey(type))
      ) as unknown) as ObjectLiteralElementLike;
    });
  } else {
    const packedProps = pack(
      // fixme: replace 64 with correct data type bit size
      Object.keys(properties).map((name) => [name, 64])
    )

    const fields: Slot = {}
    let currentSlot = 0
    for (const slot of packedProps) {
      // console.log(slot)
      let offset = 0
      for (const [name, bits] of slot) {
        fields[name] = {
          name,
          slot: currentSlot,
          size: bits,
          offset
        }
        offset += bits
      }
      currentSlot += 1
    }

    const props = []
    let index = 0
    for (const slot of packedProps) {
      // add comments for each field
      props.push(createSingleLineComment(`Field ${index} has ${slot.length} variables`))
      for (const [name, bits] of slot) {
        console.log(name)
        props.push(createSingleLineComment(`${name}: ${bits} bits`))
      }
      props.push(
        (
          ts.factory.createPropertyAssignment(
            `_field${index}`,
            ts.factory.createIdentifier("Field")
          ) as unknown
        ) as ObjectLiteralElementLike
      )
      index += 1
    }
    return props
  }
}

function createSingleLineComment(text: string) {
  return (ts.factory.createIdentifier(`// ${text}`) as unknown) as ts.Statement;
}

// declarations

function createClass(name: string, entity: any) {
  const { properties } = entity;

  const assertFn = createAssertFunction();
  const checkFn = createCheckFunction(entity);
  const constructorFn = createConstructorFunction(entity);

  // console.log('creating props', properties)
  const props = getProperties(properties, true);

  const propertyMapping = getPropertyMapping(properties)

  const accessors = Object.entries(propertyMapping).map(([key, fieldId]: [string, number], index: number) => {
    return [
      createPropertyGetter(key, fieldId, index),
      createPropertySetter(key, fieldId, index)
    ]
  })

  const layout = getStorageLayout(properties)

  // console.log(layout)
  // for (const slot of layout) {
  //   console.log(slot)
  //   createInitField(slot)
  //   for (const v of slot) {
  //     console.log(v)

  //   }
  // }

  const fieldInitializators = layout.map(slot => createInitField(slot))

  const consts = createConstants(layout)

  const members = [
    ...consts,
    constructorFn,
    checkFn,
    ...accessors.flat(),
    ...fieldInitializators
  ];

  return ts.factory.createClassDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    name,
    undefined,
    [
      ts.factory.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
        ts.factory.createExpressionWithTypeArguments(
          ts.factory.createCallExpression(
            ts.factory.createIdentifier("Struct"),
            undefined,
            [ts.factory.createObjectLiteralExpression(props, true)]
          ),
          undefined
        ),
      ]),
    ],
    members
  );
}

function _createNewField(init: number | string) {
  const args = []
  if (typeof(init) === 'number') {
    args.push(
      factory.createBinaryExpression(
        factory.createNumericLiteral('2'),
        factory.createToken(ts.SyntaxKind.AsteriskAsteriskToken),
        factory.createNumericLiteral(init)
      )
    )
  } else if (typeof(init) === 'string') {
    // bleep
  } else {
    // expressions?
  }
  return ts.factory.createNewExpression(ts.factory.createIdentifier('Field'), undefined, args)
}

function createConstants(layout: StorageLayout) {
  const consts = []
  for (const slot of layout) {
    for (const v of slot) {
      // console.log(v.name, v.offset, v.size)
      const offset_constant = ts.factory.createVariableDeclaration(
        `${v.name.toUpperCase()}_OFFSET`,
        undefined,
        undefined,
        _createNewField(v.offset)
        )
        const size_constant = ts.factory.createVariableDeclaration(
          `${v.name.toUpperCase()}_SIZE`,
          undefined,
          undefined,
          _createNewField(v.size)
      )
      consts.push(offset_constant, size_constant)
    }
  }
  return consts
}

function createInitField(slot: SlotValue[]) {
  const statements = [
    `let r = new Field(${slot[0].name});`,
  ]

  for (let i = 1; i < slot.length; i++) {
    console.log(slot[i])
    statements.push(
      `r.add(${slot[i].name}.mul(this.${slot[i].name.toUpperCase()}_OFFSET));`,
    )
  }
  statements.push('return r')

  const params = slot.map(
    (v: SlotValue) => ts.factory.createParameterDeclaration(
      undefined,
      undefined,
      ts.factory.createIdentifier(v.name),
      undefined,
      ts.factory.createTypeReferenceNode(
        ts.factory.createIdentifier("Field"),
        undefined
      )
  ))


  // hack: parse the function body string into AST nodes
  const sourceFile = ts.createSourceFile('', statements.join('\n'), ts.ScriptTarget.Latest, true);
  const sts = sourceFile.statements;

  console.log(slot)

  // console.log(sts)
  return ts.factory.createMethodDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.StaticKeyword)],
    NO_ASTERISK,
    `_fillField${slot[0].slot}`,
    NO_QUESTION_TOKEN,
    NO_TYPED_PARAMS,
    params,
    NO_TYPED_NODE,
    ts.factory.createBlock(sts, true)
  )
}

function createConstructorFunction(entity) {
  const { properties } = entity;

  // const props = Object.keys(properties).map((name) => name);

  // constructor params
  const parameters = Object.keys(properties).map((key) => {
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

  const layout = getStorageLayout(properties)

  const superProps = layout.map((slot, index) => {
    return ts.factory.createPropertyAssignment(
      ts.factory.createIdentifier(`_field${index}`),
      ts.factory.createCallExpression(
        ts.factory.createIdentifier(`pepe._fillField${index}`),
        undefined,
        slot.map((v) => ts.factory.createIdentifier(v.name))
      )
    )
  })
  
  const superCall = ts.factory.createExpressionStatement(
    ts.factory.createCallExpression(
      ts.factory.createSuper(),
      undefined,
      [
      ts.factory.createObjectLiteralExpression(
        superProps,
        true
      )
    ])
  )


  const checkCall = ts.factory.createExpressionStatement(
    ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createThis(),
        ts.factory.createIdentifier('checks')
      ),
      undefined,
      []
    )
  )

  const statements = [superCall, checkCall]

  const fn = ts.factory.createConstructorDeclaration(
    undefined,
    parameters,
    ts.factory.createBlock(statements, true)
  );
  return fn;
}

function _getCheckStatement(propertyName: string, property: any) {
  const { type, format } = property;
  const statements: ts.Statement[] = [];

  switch (type) {
    case "string":
      statements.push(..._getStringAsserts(propertyName, property));
      break;
    case "integer":
      if (format === "unix-time") {
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
  return statements;
}

function createCheckFunction(entity: any) {
  const { properties } = entity;

  const parameters: ts.ParameterDeclaration[] = [];

  const statements: ts.Statement[] = [
    createSingleLineComment("Check"),
    ...Object.entries(properties).map(
      ([name, property]) => _getCheckStatement(name, property)
    ).flat()
  ];

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

function stringToStaments(statements: string[]) {
  // hack: parse the function body string into AST nodes
  const sourceFile = ts.createSourceFile('', statements.join('\n'), ts.ScriptTarget.Latest, true);
  const sts = sourceFile.statements;
  return sts  
}

function createPropertyGetter(
  propertyName: string,
  fieldId: number,
  position: number
) {
  // return this._extract(this.field1, position)
  const returnStatement = factory.createReturnStatement(
    factory.createCallExpression(
      factory.createIdentifier('_get'),
      undefined,
      [
        factory.createPropertyAccessExpression(
          factory.createThis(),
          factory.createIdentifier("_field" + fieldId)
        ),
        factory.createPropertyAccessExpression(
          factory.createThis(),
          factory.createIdentifier(`${propertyName.toUpperCase()}_OFFSET`)
        ),
        factory.createPropertyAccessExpression(
          factory.createThis(),
          factory.createIdentifier(`${propertyName.toUpperCase()}_SIZE`)
        )
      ])
  )
  const block = ts.factory.createBlock([returnStatement], true);
  const getter = ts.factory.createGetAccessorDeclaration(
    undefined,
    ts.factory.createIdentifier(propertyName),
    [],
    undefined,
    // ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
    block
  );

  return getter;
}

function createPropertySetter(
  propertyName: string,
  fieldId: number,
  position: number
) {
  const statement = ts.factory.createExpressionStatement(
    ts.factory.createBinaryExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createThis(),
        ts.factory.createIdentifier("_field" + fieldId)
      ),
      ts.factory.createToken(ts.SyntaxKind.FirstAssignment),
      ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
          ts.factory.createThis(),
          ts.factory.createIdentifier("_set")
        ),
        undefined,
        [
          factory.createPropertyAccessExpression(factory.createThis(), factory.createIdentifier("_field" + fieldId)),
          factory.createPropertyAccessExpression(factory.createThis(), factory.createIdentifier(`${propertyName.toUpperCase()}_OFFSET`)),
          factory.createPropertyAccessExpression(factory.createThis(), factory.createIdentifier(`${propertyName.toUpperCase()}_SIZE`)),
        ]
      )
    )
  );
  const params = [
    ts.factory.createParameterDeclaration(
      undefined,
      undefined,
      ts.factory.createIdentifier("value"),
      undefined,
      undefined
      // ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
    ),
  ];

  const body = ts.factory.createBlock([statement], true);
  const setter = ts.factory.createSetAccessorDeclaration(
    undefined,
    ts.factory.createIdentifier(propertyName),
    params,
    body
  );


  
  return setter;
}

function createImportStaments() {
  const names = ts.factory.createNamedImports([
    ts.factory.createImportSpecifier(
      false,
      undefined,
      ts.factory.createIdentifier("Field")
    ),
    ts.factory.createImportSpecifier(
      false,
      undefined,
      ts.factory.createIdentifier("SmartContract")
    ),
    ts.factory.createImportSpecifier(
      false,
      undefined,
      ts.factory.createIdentifier("state")
    ),
    ts.factory.createImportSpecifier(
      false,
      undefined,
      ts.factory.createIdentifier("State")
    ),
    ts.factory.createImportSpecifier(
      false,
      undefined,
      ts.factory.createIdentifier("method")
    ),
    ts.factory.createImportSpecifier(
      false,
      undefined,
      ts.factory.createIdentifier("Poseidon")
    ),
    ts.factory.createImportSpecifier(
      false,
      undefined,
      ts.factory.createIdentifier("Bool")
    ),
    ts.factory.createImportSpecifier(
      false,
      undefined,
      ts.factory.createIdentifier("Struct")
    ),
  ]);

  return [
    ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createImportClause(false, undefined, names),
      ts.factory.createStringLiteral("snarkyjs")
    ),
    ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createImportClause(
        false,
        undefined,
        ts.factory.createNamedImports([
          ts.factory.createImportSpecifier(
            false,
            undefined,
            ts.factory.createIdentifier("CircuitNumber")
          ),
        ])
      ),
      ts.factory.createStringLiteral("snarkyjs-math/build/src/snarkyjs-math")
    ),
    ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createImportClause(
        false,
        undefined,
        ts.factory.createNamedImports([
          ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier("get")),
          ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier("set")),
        ])
      ),
      ts.factory.createStringLiteral("../storage")
    )
  ];
}

export function createEntity(name: string, definitions: any) {
  const entity = definitions[name];
  const { properties } = entity;

  // single line import statement
  const imports: ts.ImportDeclaration[] = createImportStaments();

  // create class definitoin
  const clazz = createClass(name, entity);

  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
  });

  // create source file including imports and class definition
  const sf = ts.factory.createSourceFile(
    [...imports, clazz],
    ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None
  );
  const source = printer.printFile(sf);

  // if generated dir does not exist, create it
  if (!fs.existsSync("./src/generated")) fs.mkdirSync("./src/generated");
  // write created struct to file
  fs.writeFileSync(`./src/generated/${name}.ts`, source);
}
