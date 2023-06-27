# zok

ZOK is a snakyJs utility that allows developers to express and validate the structure of their data in a reusable format.

## Install
```
yarn add zok
```

## How to use
1. Describe the schemas with zod under the root folder in schemas.ts
2. Execute CLI 

Generate a file for every zod schema schemas.
```ts
yarn zok 
```
Specify a single schema.
```ts
yarn zok file_name zod_schema_case
```

3. Import the generated Structs into you ZkDapp

```ts
import zod_schema_case from "structs/file_name.ts"
```

## Example

### Zod schema
```ts
// cases.ts
export const FieldStruct = z.object({
    f: z.number().lt(10),
    g: z.number().gt(0),
    h: z.number().lte(5),
    i: z.number().gte(0),
}).describe('Benchmark schema definitions')
```

### Generated struct
```ts
// ./structs/FieldStruct.ts" 
import { Field } from 'snarkyjs';
export class FieldStruct extends Struct({
    f: Field,
    g: Field,
    h: Field,
    i: Field
}) {
    constructor(f: Field, g: Field, h: Field, i: Field) {
        super({ f, g, h, i });
        this.check();
    }
    public check() {
        this.f.assertLessThan(10, "f must be less than 10")
        // exclusive minimum
        this.g.assertGreaterThan(0, "g must be greater than 0")
        this.h.assertLessThanOrEqual(5, "h must be less or equal than 5")
        this.i.assertGreaterThanOrEqual(0, "i must be greater or equal than 0")
    }
    _assert(expr: unknown, msg?: string) { if (!expr)
        throw new Error(msg); }
}
```

### Import and consume 
```ts
// index.ts
import FieldStruct from './structs/FieldStruct'; 

const field = new FieldStruct(
  Field(1),
  Field(99),
  Field(1),
  Field(1),
);
```


## Supported types

| zod type     | zod restraint     | snarky type |
|--------------|-----------|------------|
| z.number()      | .min() .max() .lt() .lt() .lte() .gte() .positive()| Field       |
| z.date()      | .min() .max()  | Field       |
| z.bool() |      | Bool        |