"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEntity = void 0;
const fs = __importStar(require("fs"));
const typescript_1 = __importDefault(require("typescript"));
const NO_MODIFIERS = [];
const NO_ASTERISK = undefined;
const NO_QUESTION_TOKEN = undefined;
const NO_TYPED_PARAMS = undefined;
const NO_TYPED_NODE = undefined;
function _getTypeFromPropKey(key) {
    return key == 'boolean' ? 'Bool' : 'Field';
}
function _getAssertCallStatement(expr, message) {
    return typescript_1.default.factory.createCallExpression(typescript_1.default.factory.createIdentifier(`this._assert`), undefined, [expr, message]);
}
// property asserts
function _gtAssert(propertyName, min) {
    const binaryExpr = typescript_1.default.factory.createBinaryExpression(typescript_1.default.factory.createIdentifier(`this.${propertyName}`), typescript_1.default.factory.createToken(typescript_1.default.SyntaxKind.GreaterThanToken), typescript_1.default.factory.createNumericLiteral(min.toString()));
    const message = typescript_1.default.factory.createStringLiteral(`${propertyName} must be greater than ${min}`);
    const callExpr = typescript_1.default.factory.createCallExpression(typescript_1.default.factory.createPropertyAccessExpression(typescript_1.default.factory.createIdentifier(`this.${propertyName}`), typescript_1.default.factory.createIdentifier("assertGreaterThan")), undefined, [
        typescript_1.default.factory.createNumericLiteral(min),
        message
    ]);
    return callExpr;
}
function _gteAssert(propertyName, min) {
    const message = typescript_1.default.factory.createStringLiteral(`${propertyName} must be greater or equal than ${min}`);
    const callExpr = typescript_1.default.factory.createCallExpression(typescript_1.default.factory.createPropertyAccessExpression(typescript_1.default.factory.createIdentifier(`this.${propertyName}`), typescript_1.default.factory.createIdentifier("assertGreaterThanOrEqual")), undefined, [
        typescript_1.default.factory.createNumericLiteral(min),
        message
    ]);
    return callExpr;
}
function _ltAssert(propertyName, max) {
    // if (max < 0) {
    //   throw new Error('numbers in MINA cannot go below zero')
    // }
    const message = typescript_1.default.factory.createStringLiteral(`${propertyName} must be less than ${max}`);
    const callExpr = typescript_1.default.factory.createCallExpression(typescript_1.default.factory.createPropertyAccessExpression(typescript_1.default.factory.createIdentifier(`this.${propertyName}`), typescript_1.default.factory.createIdentifier("assertLessThan")), undefined, [
        typescript_1.default.factory.createNumericLiteral(max),
        message
    ]);
    return callExpr;
}
function _lteAssert(propertyName, max) {
    const message = typescript_1.default.factory.createStringLiteral(`${propertyName} must be less or equal than ${max}`);
    const callExpr = typescript_1.default.factory.createCallExpression(typescript_1.default.factory.createPropertyAccessExpression(typescript_1.default.factory.createIdentifier(`this.${propertyName}`), typescript_1.default.factory.createIdentifier("assertLessThanOrEqual")), undefined, [
        typescript_1.default.factory.createNumericLiteral(max),
        message
    ]);
    return callExpr;
}
function _getBooleanAsserts(propertyName, property) {
    const statements = [];
    return statements;
}
function _getNumberAsserts(propertyName, property) {
    const statements = [];
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
function _getStringAsserts(propertyName, property) {
    const statements = [];
    return statements;
}
function _getDateAsserts(propertyName, property) {
    const statements = [];
    if (property.minimum !== undefined) {
        statements.push(_gteAssert(propertyName, property.minimum));
    }
    if (property.maximum !== undefined) {
        statements.push(_lteAssert(propertyName, property.maximum));
    }
    return statements;
}
// utils
function getProperties(properties) {
    return Object.keys(properties).map((key) => {
        const type = properties[key]?.type;
        return typescript_1.default.factory.createPropertyAssignment(key, typescript_1.default.factory.createIdentifier(_getTypeFromPropKey(type)));
    });
}
function createSingleLineComment(text) {
    return typescript_1.default.factory.createIdentifier(`// ${text}`);
}
// declarations
function createClass(name, entity) {
    const { properties } = entity;
    const props = getProperties(properties);
    const assertFn = createAssertFunction();
    const checkFn = createCheckFunction(entity);
    const constructorFn = createConstructorFunction(entity);
    const members = [
        constructorFn,
        checkFn,
        assertFn,
    ];
    return typescript_1.default.factory.createClassDeclaration([
        typescript_1.default.factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)
    ], name, undefined, [
        typescript_1.default.factory.createHeritageClause(typescript_1.default.SyntaxKind.ExtendsKeyword, [
            typescript_1.default.factory.createExpressionWithTypeArguments(typescript_1.default.factory.createCallExpression(typescript_1.default.factory.createIdentifier('Struct'), undefined, [
                typescript_1.default.factory.createObjectLiteralExpression(props, true)
            ]), undefined)
        ])
    ], members);
}
function createConstructorFunction(entity) {
    const { properties } = entity;
    const props = Object.keys(properties).map(name => name);
    // constructor params
    const parameters = props.map((key) => {
        const type = properties[key]?.type;
        return typescript_1.default.factory.createParameterDeclaration(undefined, undefined, typescript_1.default.factory.createIdentifier(key), undefined, typescript_1.default.factory.createTypeReferenceNode(
        // todo : this should be the correct type, for now we always return Field 
        typescript_1.default.factory.createIdentifier(_getTypeFromPropKey(type)), undefined));
    });
    const superCall = typescript_1.default.factory.createExpressionStatement(typescript_1.default.factory.createCallExpression(typescript_1.default.factory.createSuper(), undefined, [
        typescript_1.default.factory.createObjectLiteralExpression(props.map(key => {
            return typescript_1.default.factory.createShorthandPropertyAssignment(typescript_1.default.factory.createIdentifier(key), undefined // uninitalized
            );
        }))
    ]));
    const checkCall = typescript_1.default.factory.createExpressionStatement(typescript_1.default.factory.createCallExpression(typescript_1.default.factory.createPropertyAccessExpression(typescript_1.default.factory.createThis(), typescript_1.default.factory.createIdentifier('check')), undefined, []));
    const statements = [superCall, checkCall];
    const fn = typescript_1.default.factory.createConstructorDeclaration(undefined, parameters, typescript_1.default.factory.createBlock(statements, true));
    return fn;
}
function _getCheckStatement(propertyName, property) {
    const { type, format } = property;
    const statements = [];
    switch (type) {
        case "string":
            statements.push(..._getStringAsserts(propertyName, property));
        case "integer":
            if (format === 'unix-time') {
                statements.push(..._getDateAsserts(propertyName, property));
            }
        case "number":
            statements.push(..._getNumberAsserts(propertyName, property));
        case "boolean":
            statements.push(..._getBooleanAsserts(propertyName, property));
    }
    return statements;
}
function createCheckFunction(entity) {
    const { properties } = entity;
    const parameters = [];
    const statements = Object.entries(properties).map(([name, property]) => _getCheckStatement(name, property)).flat();
    const checkFn = typescript_1.default.factory.createMethodDeclaration([typescript_1.default.factory.createModifier(typescript_1.default.SyntaxKind.PublicKeyword)], NO_ASTERISK, "check", NO_QUESTION_TOKEN, NO_TYPED_PARAMS, parameters, NO_TYPED_NODE, typescript_1.default.factory.createBlock(statements, true));
    return checkFn;
}
function createAssertFunction() {
    return typescript_1.default.factory.createMethodDeclaration(NO_MODIFIERS, NO_ASTERISK, "_assert", NO_QUESTION_TOKEN, NO_TYPED_PARAMS, [
        typescript_1.default.factory.createParameterDeclaration(undefined, undefined, typescript_1.default.factory.createIdentifier("expr"), undefined, typescript_1.default.factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.UnknownKeyword)),
        typescript_1.default.factory.createParameterDeclaration(undefined, undefined, typescript_1.default.factory.createIdentifier("msg"), typescript_1.default.factory.createToken(typescript_1.default.SyntaxKind.QuestionToken), typescript_1.default.factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.StringKeyword)),
    ], NO_TYPED_NODE, typescript_1.default.factory.createBlock([
        // if (!expr) 
        typescript_1.default.factory.createIfStatement(typescript_1.default.factory.createPrefixUnaryExpression(typescript_1.default.SyntaxKind.ExclamationToken, typescript_1.default.factory.createIdentifier("expr")), 
        // throw new Error(msg)
        typescript_1.default.factory.createThrowStatement(typescript_1.default.factory.createNewExpression(typescript_1.default.factory.createIdentifier("Error"), undefined, [typescript_1.default.factory.createIdentifier("msg")])), 
        // no else
        undefined),
    ], false));
}
function createImportStaments() {
    const names = typescript_1.default.factory.createNamedImports([
        typescript_1.default.factory.createImportSpecifier(false, undefined, typescript_1.default.factory.createIdentifier('Field')),
        typescript_1.default.factory.createImportSpecifier(false, undefined, typescript_1.default.factory.createIdentifier('SmartContract')),
        typescript_1.default.factory.createImportSpecifier(false, undefined, typescript_1.default.factory.createIdentifier('state')),
        typescript_1.default.factory.createImportSpecifier(false, undefined, typescript_1.default.factory.createIdentifier('State')),
        typescript_1.default.factory.createImportSpecifier(false, undefined, typescript_1.default.factory.createIdentifier('method')),
        typescript_1.default.factory.createImportSpecifier(false, undefined, typescript_1.default.factory.createIdentifier('Poseidon')),
        typescript_1.default.factory.createImportSpecifier(false, undefined, typescript_1.default.factory.createIdentifier('Bool')),
        typescript_1.default.factory.createImportSpecifier(false, undefined, typescript_1.default.factory.createIdentifier('Struct'))
    ]);
    return typescript_1.default.factory.createImportDeclaration(undefined, typescript_1.default.factory.createImportClause(false, undefined, names), typescript_1.default.factory.createStringLiteral('snarkyjs'));
}
function createEntity(name, definitions) {
    const entity = definitions[name];
    const { properties } = entity;
    // single line import statement
    const imports = [createImportStaments()];
    // create class definitoin
    const clazz = createClass(name, entity);
    const printer = typescript_1.default.createPrinter({
        newLine: typescript_1.default.NewLineKind.LineFeed,
    });
    // create source file including imports and class definition
    const sf = typescript_1.default.factory.createSourceFile([...imports, clazz], typescript_1.default.factory.createToken(typescript_1.default.SyntaxKind.EndOfFileToken), typescript_1.default.NodeFlags.None);
    const source = printer.printFile(sf);
    // if generated dir does not exist, create it
    if (!fs.existsSync('./src/generated'))
        fs.mkdirSync('./src/generated');
    // write created struct to file
    fs.writeFileSync(`./src/generated/${name}.ts`, source);
}
exports.createEntity = createEntity;
