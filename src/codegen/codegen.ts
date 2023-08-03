import * as fs from "fs";
import ts, { ObjectLiteralElementLike } from "typescript";

import { getStorageLayout, pack } from "./properties.js";
import { GeneratorOptions, Slot, SlotValue, StorageLayout } from "../types.js";
import { createSingleLineComment, getPropertyMapping } from "./utils.js";
import { _getBooleanAsserts, _getDateAsserts, _getNumberAsserts, _getStringAsserts } from "./asserts.js";

const factory = ts.factory;

const NO_MODIFIERS: ts.Modifier[] = [];

const NO_ASTERISK = undefined;
const NO_QUESTION_TOKEN = undefined;
const NO_TYPED_PARAMS = undefined;
const NO_TYPED_NODE = undefined;

function _getTypeFromPropKey(key: string) {
  return key == "boolean" ? "Bool" : "Field";
}

function getProperties(
  properties: { [key: string]: { type: string } },
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
    );

    const fields: Slot = {};
    let currentSlot = 0;
    for (const slot of packedProps) {
      // console.log(slot)
      let offset = 0;
      for (const [name, bits] of slot) {
        fields[name] = {
          name,
          slot: currentSlot,
          size: bits,
          offset,
        };
        offset += bits;
      }
      currentSlot += 1;
    }

    const props = [];
    let index = 0;
    for (const slot of packedProps) {
      // add comments for each field
      props.push(
        createSingleLineComment(`Field ${index} has ${slot.length} variables`)
      );
      for (const [name, bits] of slot) {
        console.log(name);
        props.push(createSingleLineComment(`${name}: ${bits} bits`));
      }
      props.push(
        (ts.factory.createPropertyAssignment(
          `_field${index}`,
          ts.factory.createIdentifier("Field")
        ) as unknown) as ObjectLiteralElementLike
      );
      index += 1;
    }
    return props;
  }
}

// declarations

// todo : we can group up these args into a single object
function createClass(name: string, entity: any, options: GeneratorOptions) {
  const { properties } = entity;

  const assertFn = createAssertFunction();
  const checkFn = createCheckFunction(entity);
  const constructorFn = createConstructorFunction(name, entity, options);

  // console.log('creating props', properties)
  const props = getProperties(properties, options.packed);

  const propertyMapping = getPropertyMapping(properties);

  const accessors = Object.entries(propertyMapping).map(
    // @ts-ignore
    ([key, fieldId]: [string, number], index: number): any => {
      return [
        createPropertyGetter(name, key, fieldId, index, options),
        createPropertySetter(name, key, fieldId, index, options),
      ];
    }
  );

  const layout = getStorageLayout(properties);

  // console.log(layout)
  // for (const slot of layout) {
  //   console.log(slot)
  //   createInitField(slot)
  //   for (const v of slot) {
  //     console.log(v)

  //   }
  // }

  const fieldInitializators = options.packed ? layout.map((slot) => createInitField(slot)) : []
    
  const consts = options.packed ? createConstants(layout, options) : []

  const members = [
    ...consts,
    constructorFn,
    checkFn,
    ...accessors.flat(),
    ...fieldInitializators,
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
            [ts.factory.createObjectLiteralExpression(props as any, true)]
          ),
          NO_TYPED_NODE
        ),
      ]),
    ],
    members
  );
}

function _createNewField(init: number | string) {
  const args = [];
  if (typeof init === "number") {
    args.push(factory.createNumericLiteral(init));
  } else if (typeof init === "string") {
    // bleep
  } else {
    // expressions?
  }
  return ts.factory.createNewExpression(
    ts.factory.createIdentifier("Field"),
    undefined,
    args
  );
}

function createConstants(layout: StorageLayout, options: GeneratorOptions) {
  const consts = [];
  for (const slot of layout) {
    for (const v of slot) {
      // console.log(v.name, v.offset, v.size)

      const offset_constant = factory.createPropertyDeclaration(
        [factory.createModifier(ts.SyntaxKind.StaticKeyword)],
        `${v.name.toUpperCase()}_OFFSET`,
        NO_QUESTION_TOKEN,
        NO_TYPED_NODE,
        _createNewField(v.offset)
      )
      const size_constant = factory.createPropertyDeclaration(
        [factory.createModifier(ts.SyntaxKind.StaticKeyword)],
        `${v.name.toUpperCase()}_SIZE`,
        NO_QUESTION_TOKEN,
        NO_TYPED_NODE,
        _createNewField(v.size)
      )

      // const offset_constant = factory.createVariableDeclaration(
      //   `${v.name.toUpperCase()}_OFFSET`,
      //   undefined,
      //   NO_TYPED_NODE,
      //   _createNewField(v.offset)
      // );
      // const size_constant = factory.createVariableDeclaration(
      //   `${v.name.toUpperCase()}_SIZE`,
      //   undefined,
      //   NO_TYPED_NODE,
      //   _createNewField(v.size)
      // );
      consts.push(offset_constant, size_constant);
    }
  }
  return consts;
}

function createInitField(slot: SlotValue[]) {
  const statements = [`let r = new Field(${slot[0].name});`];

  for (let i = 1; i < slot.length; i++) {
    console.log(slot[i]);
    statements.push(
      `r.add(${slot[i].name}.mul(this.${slot[i].name.toUpperCase()}_OFFSET));`
    );
  }
  statements.push("return r");

  const params = slot.map((v: SlotValue) =>
    ts.factory.createParameterDeclaration(
      NO_MODIFIERS,
      undefined,
      ts.factory.createIdentifier(v.name),
      undefined,
      ts.factory.createTypeReferenceNode(
        ts.factory.createIdentifier("Field"),
        NO_TYPED_NODE
      )
    )
  );

  // hack: parse the function body string into AST nodes
  const sourceFile = ts.createSourceFile(
    "",
    statements.join("\n"),
    ts.ScriptTarget.Latest,
    true
  );
  const sts = sourceFile.statements;

  console.log(slot);

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
  );
}

function createConstructorFunction(name: string, entity: any, options?: GeneratorOptions) {
  console.log(entity);
  const { properties } = entity;

  let packed = options !== undefined ? options.packed : false;

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
        ts.factory.createIdentifier(_getTypeFromPropKey(type)),
        undefined
      )
    );
  });


  let superProps
  if (packed) {
    const layout = getStorageLayout(properties);
    superProps = layout.map((slot, index) => {
      return ts.factory.createPropertyAssignment(
        ts.factory.createIdentifier(`_field${index}`),
        ts.factory.createCallExpression(
          ts.factory.createIdentifier(`${name}._fillField${index}`),
          NO_TYPED_NODE,
          slot.map((v) => ts.factory.createIdentifier(v.name))
        )
      );
    });
  } else {
    superProps = Object.keys(properties).map((key, index) => {
      return ts.factory.createPropertyAssignment(
        ts.factory.createIdentifier(key),
        ts.factory.createIdentifier(key)
      );
    });
  }


  const superCall = ts.factory.createExpressionStatement(
    ts.factory.createCallExpression(ts.factory.createSuper(), NO_TYPED_NODE, [
      ts.factory.createObjectLiteralExpression(superProps, true),
    ])
  );

  const checkCall = ts.factory.createExpressionStatement(
    ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createThis(),
        ts.factory.createIdentifier("check")
      ),
      NO_TYPED_NODE,
      []
    )
  );

  const statements = [superCall, checkCall];

  const fn = ts.factory.createConstructorDeclaration(
    NO_MODIFIERS,
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
    ...Object.entries(properties)
      .map(([name, property]) => _getCheckStatement(name, property))
      .flat(),
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
        NO_MODIFIERS,
        undefined,
        ts.factory.createIdentifier("expr"),
        NO_QUESTION_TOKEN,
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
      ),
      ts.factory.createParameterDeclaration(
        NO_MODIFIERS,
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
              NO_TYPED_NODE,
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
  const sourceFile = ts.createSourceFile(
    "",
    statements.join("\n"),
    ts.ScriptTarget.Latest,
    true
  );
  const sts = sourceFile.statements;
  return sts;
}

function createPropertyGetter(
  entityName: string,
  propertyName: string,
  fieldId: number,
  position: number,
  options: GeneratorOptions
) {
  // return this._extract(this.field1, position)
  const returnPackedStatement = factory.createReturnStatement(
    factory.createCallExpression(
      factory.createIdentifier("read"),
      NO_TYPED_NODE,
      [
        factory.createPropertyAccessExpression(
          factory.createThis(),
          factory.createIdentifier("_field" + fieldId)
        ),
        // Entity.PROPERTYNAME_OFFSET
        factory.createIdentifier(`${entityName}.${propertyName.toUpperCase()}_OFFSET`),
        factory.createIdentifier(`${entityName}.${propertyName.toUpperCase()}_SIZE`),
        // this.PROPERTYNAME_OFFSET 
        // factory.createPropertyAccessExpression(
        //   factory.createThis(),
        //   factory.createIdentifier(`${propertyName.toUpperCase()}_OFFSET`)
        // ),
        // factory.createPropertyAccessExpression(
        //   factory.createThis(),
        //   factory.createIdentifier(`${propertyName.toUpperCase()}_SIZE`)
        // )
      ]
    )
  );
  const returnStatement = factory.createReturnStatement(
    ts.factory.createPropertyAccessExpression(
      ts.factory.createThis(),
      ts.factory.createIdentifier(`${propertyName}`)
      // ts.factory.createIdentifier("_field" + fieldId)
    ),
  );
  const block = ts.factory.createBlock(
    [
      options.packed ? returnPackedStatement : returnStatement
    ],
    true
  );
  // const block = ts.factory.createBlock([returnPackedStatement], true);
  // const getter = ts.factory.createMethodDeclaration(
  //   NO_MODIFIERS,NO_ASTERISK,
  //   ts.factory.createIdentifier(`get${propertyName}`),
  //   NO_QUESTION_TOKEN, NO_TYPED_PARAMS,[],
  //   NO_TYPED_NODE,
  //   // ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
  //   block
  // );
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
  entityName: string,
  propertyName: string,
  fieldId: number,
  position: number,
  options: GeneratorOptions
) {
  const packedStatement = ts.factory.createExpressionStatement(
    ts.factory.createBinaryExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createThis(),
        ts.factory.createIdentifier("_field" + fieldId)
      ),
      ts.factory.createToken(ts.SyntaxKind.FirstAssignment),
      ts.factory.createCallExpression(
        ts.factory.createIdentifier("set"),
        NO_TYPED_NODE,
        // ts.factory.createPropertyAccessExpression(
        // ts.factory.createThis(),
        // ),
        // undefined,
        [
          factory.createPropertyAccessExpression(
            factory.createThis(),
            factory.createIdentifier("_field" + fieldId)
          ),
          factory.createIdentifier("value"),
          factory.createIdentifier(`${entityName}.${propertyName.toUpperCase()}_OFFSET`),
          factory.createIdentifier(`${entityName}.${propertyName.toUpperCase()}_SIZE`),
          // factory.createPropertyAccessExpression(factory.createThis(), factory.createIdentifier(`${propertyName.toUpperCase()}_OFFSET`)),
          // factory.createPropertyAccessExpression(factory.createThis(), factory.createIdentifier(`${propertyName.toUpperCase()}_SIZE`)),
        ]
      )
    )
  );
  const statement = ts.factory.createExpressionStatement(
    ts.factory.createBinaryExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createThis(),
        // ts.factory.createIdentifier("_field" + fieldId)
        ts.factory.createIdentifier(propertyName)
      ),
      ts.factory.createToken(ts.SyntaxKind.FirstAssignment),
      factory.createIdentifier('value')
    )
  );

  const params = [
    ts.factory.createParameterDeclaration(
      NO_MODIFIERS,
      undefined,
      ts.factory.createIdentifier("value"),
      NO_QUESTION_TOKEN,
      NO_TYPED_NODE
      // ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
    ),
  ];

  const body = ts.factory.createBlock(
    [
      options.packed ? packedStatement : statement
    ],
    true
  );
  // const setter = ts.factory.createMethodDeclaration(
  //   NO_MODIFIERS,NO_ASTERISK,
  //   ts.factory.createIdentifier(`set${propertyName}`),
  //   NO_QUESTION_TOKEN, NO_TYPED_PARAMS, params,
  //   NO_TYPED_NODE,
  //   body
  // );
  const setter = ts.factory.createSetAccessorDeclaration(
    NO_MODIFIERS,
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
          // ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier("get")),
          ts.factory.createImportSpecifier(
            false,
            undefined,
            ts.factory.createIdentifier("read")
          ),
          ts.factory.createImportSpecifier(
            false,
            undefined,
            ts.factory.createIdentifier("set")
          ),
        ])
      ),
      ts.factory.createStringLiteral("z0k/src/lib/storage")
    ),
  ];
}

export function createEntity(name: string, definitions: any, options: GeneratorOptions) {
  const entity = definitions[name];
  const { properties } = entity;

  console.log(options)

  // single line import statement
  const imports: ts.ImportDeclaration[] = createImportStaments();

  // create class definitoin
  const clazz = createClass(`${name}Struct`, entity, options);

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
  fs.writeFileSync(`./src/generated/${name}Struct.ts`, source);
}
