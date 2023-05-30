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
const fs = __importStar(require("fs"));
const zod_to_json_schema_1 = require("zod-to-json-schema");
const typescript_1 = __importDefault(require("typescript"));
const cases_1 = require("./cases");
const vaccineJson = (0, zod_to_json_schema_1.zodToJsonSchema)(cases_1.Vaccine, "vaccine");
const benchmarkJson = (0, zod_to_json_schema_1.zodToJsonSchema)(cases_1.Benchmark, "Benchmark");
const square = (0, zod_to_json_schema_1.zodToJsonSchema)(cases_1.Benchmark, "Square");
// console.log(jsonSchema.definitions);
const { definitions } = square;
if (definitions === undefined) {
}
else {
    for (const entity of Object.keys(definitions)) {
        console.log('create entity', entity);
        createEntity(entity, definitions);
    }
}
function createThrow() {
    return typescript_1.default.factory.createThrowStatement(typescript_1.default.factory.createNewExpression(typescript_1.default.factory.createIdentifier("Error"), undefined, [typescript_1.default.factory.createIdentifier("msg")]));
}
function createAssertFunction() {
    return typescript_1.default.factory.createMethodDeclaration([
        typescript_1.default.factory.createModifier(typescript_1.default.SyntaxKind.PublicKeyword),
    ], undefined, "_assert", undefined, undefined, [
        typescript_1.default.factory.createParameterDeclaration(undefined, undefined, typescript_1.default.factory.createIdentifier("expr"), undefined, typescript_1.default.factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.UnknownKeyword)),
        typescript_1.default.factory.createParameterDeclaration(undefined, undefined, typescript_1.default.factory.createIdentifier("msg"), typescript_1.default.factory.createToken(typescript_1.default.SyntaxKind.QuestionToken), typescript_1.default.factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.StringKeyword)),
    ], undefined, typescript_1.default.factory.createBlock([
        typescript_1.default.factory.createIfStatement(typescript_1.default.factory.createPrefixUnaryExpression(typescript_1.default.SyntaxKind.ExclamationToken, typescript_1.default.factory.createIdentifier("expr")), typescript_1.default.factory.createThrowStatement(typescript_1.default.factory.createNewExpression(typescript_1.default.factory.createIdentifier("Error"), undefined, [typescript_1.default.factory.createIdentifier("msg")])), undefined),
    ], true));
    // ts.factory.createExpressionStatement(ts.factory.createIdentifier('expr')),
}
function createCheckFunction(entity) {
    const { properties } = entity;
    const parameters = [];
    const statements = [];
    // console.log('properties', properties)
    for (const key of Object.keys(properties)) {
        console.log('property name', key);
        const property = properties[key];
        if (property === undefined)
            continue;
        const { type } = property;
        console.log(type);
        function _getAssertCallStatement(expr, message) {
            return typescript_1.default.factory.createCallExpression(typescript_1.default.factory.createIdentifier(`this._assert`), undefined, [expr, message]);
        }
        function _getMinimumValueAssert(min) {
            const binaryExpr = typescript_1.default.factory.createBinaryExpression(typescript_1.default.factory.createIdentifier(`this.${key}`), typescript_1.default.factory.createToken(typescript_1.default.SyntaxKind.GreaterThanToken), typescript_1.default.factory.createNumericLiteral(min.toString()));
            const call = typescript_1.default.factory.createCallExpression(typescript_1.default.factory.createPropertyAccessExpression(typescript_1.default.factory.createIdentifier(`this.${key}`), typescript_1.default.factory.createIdentifier('greaterThan')), undefined, [typescript_1.default.factory.createNumericLiteral(min)]);
            const message = typescript_1.default.factory.createStringLiteral(`${key} must be greater than ${min}`);
            return _getAssertCallStatement(call, message);
        }
        function _getExclusiveMinimumValueAssert(min) {
            const callExpr = typescript_1.default.factory.createCallExpression(typescript_1.default.factory.createPropertyAccessExpression(typescript_1.default.factory.createIdentifier(`this.${key}`), typescript_1.default.factory.createIdentifier('greaterThanOrEqual')), undefined, [typescript_1.default.factory.createNumericLiteral(min)]);
            const message = typescript_1.default.factory.createStringLiteral(`${key} must be greater or equal than ${min}`);
            return _getAssertCallStatement(callExpr, message);
        }
        function _getMaximumValueAssert(max) {
            const callExpr = typescript_1.default.factory.createCallExpression(typescript_1.default.factory.createPropertyAccessExpression(typescript_1.default.factory.createIdentifier(`this.${key}`), typescript_1.default.factory.createIdentifier('greaterThanOrEqual')), undefined, [typescript_1.default.factory.createNumericLiteral(max)]);
            const message = typescript_1.default.factory.createStringLiteral(`${key} must be less than ${max}`);
            return _getAssertCallStatement(callExpr, message);
        }
        function _getExclusiveMaximumValueAssert(max) {
            const callExpr = typescript_1.default.factory.createCallExpression(typescript_1.default.factory.createPropertyAccessExpression(typescript_1.default.factory.createIdentifier(`this.${key}`), typescript_1.default.factory.createIdentifier('lessThanOrEqual')), undefined, [typescript_1.default.factory.createNumericLiteral(max)]);
            const message = typescript_1.default.factory.createStringLiteral(`${key} must be less or equal than ${max}`);
            return _getAssertCallStatement(callExpr, message);
        }
        function _getBooleanAsserts(property) {
            const statements = [];
            return statements;
        }
        function createSingleLineComment(text) {
            return typescript_1.default.factory.createIdentifier('// '.concat(text));
        }
        function _getNumberAsserts(property) {
            const statements = [];
            if (property.minimum !== undefined) {
                statements.push(_getMinimumValueAssert(property.minimum));
            }
            if (property.exclusiveMinimum !== undefined) {
                statements.push(createSingleLineComment('exclusive minimum'));
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
        function _getStringAsserts(property) {
            const statements = [];
            return statements;
        }
        console.log(property);
        switch (type) {
            case "string":
                statements.push(..._getStringAsserts(property));
            case "number":
                statements.push(..._getNumberAsserts(property));
            case "boolean":
                statements.push(..._getBooleanAsserts(property));
        }
    }
    const checkFn = typescript_1.default.factory.createMethodDeclaration([typescript_1.default.factory.createModifier(typescript_1.default.SyntaxKind.PublicKeyword)], undefined, "check", undefined, undefined, parameters, undefined, typescript_1.default.factory.createBlock(statements, true));
    return checkFn;
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
function getProperties(properties) {
    return Object.keys(properties).map((key) => {
        return typescript_1.default.factory.createPropertyAssignment(key, typescript_1.default.factory.createIdentifier('Field'));
    });
}
function createClass(entity) {
    const { properties } = entity;
    console.log(entity);
    const props = getProperties(properties);
    const assertFn = createAssertFunction();
    const checkFn = createCheckFunction(entity);
    const members = [
        checkFn,
        assertFn
    ];
    return typescript_1.default.factory.createClassDeclaration([
        typescript_1.default.factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)
    ], "Square", undefined, [
        typescript_1.default.factory.createHeritageClause(typescript_1.default.SyntaxKind.ExtendsKeyword, [
            typescript_1.default.factory.createExpressionWithTypeArguments(typescript_1.default.factory.createCallExpression(typescript_1.default.factory.createIdentifier('Struct'), undefined, [
                typescript_1.default.factory.createObjectLiteralExpression(props, true)
            ]), undefined)
        ])
    ], members);
}
function createEntity(name, definitions) {
    const entity = definitions[name];
    const { properties } = entity;
    // const parameters: ts.ParameterDeclaration[] = [];
    const imports = [createImportStaments()];
    const clazz = createClass(entity);
    const printer = typescript_1.default.createPrinter({
        newLine: typescript_1.default.NewLineKind.LineFeed,
    });
    const sf = typescript_1.default.factory.createSourceFile([...imports, clazz], typescript_1.default.factory.createToken(typescript_1.default.SyntaxKind.EndOfFileToken), typescript_1.default.NodeFlags.None);
    const source = printer.printFile(sf);
    fs.writeFileSync('./src/structs.ts', source);
}
