# zok

ZOK is a snakyJs utility that allows developers to express and validate the structure of their data in [zod](https://zod.dev/) schemas.

## Install
```bash
# yarn
yarn add z0k

# npm
npm install z0k
```

## Usage
1. Describe the schemas with zod under the src folder in `schemas.ts`
2. Build your zkDapp `yarn build`
3. Executing the ZOD 


```bash
# Generate a file for every zod schema in schemas.ts
yarn z0k 

# Change base schemas path
yarn z0k file_name 

# Specifying a single schema in schemas.ts
yarn z0k file_name zod_schema_case

```

3. Import the generated Structs into you ZkDapp

```ts
import zod_schema_case from "structs/file_name.ts"
```

## Example

```ts
// src/schemas.ts
import { z } from 'zod';

export const FieldStruct = z.object({
    f: z.number().lt(10),
    g: z.number().gt(0),
    h: z.number().lte(5),
    i: z.number().gte(0),
}).describe('Benchmark schema definitions')
```

```ts
// generated struct > src/structs/FieldStruct.ts 
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
}
```

```ts
// src/main.ts
import FieldStruct from './structs/FieldStruct'; 

const field = new FieldStruct(
  Field(1),
  Field(99),
  Field(1),
  Field(1),
);
```
### You can find a list off cases at our [mina test zdapp](https://github.com/rloot/ZOK-testDapp/blob/main/src/Cases.ts)
---
## Default entry file
`src/schemas.ts`


## Supported types

| zod type     | zod restraint     | snarky type |
|--------------|-----------|------------|
| z.number()      | .min() .max() .gt() .lt() .lte() .gte() | Field       |
| z.date()      | .min() .max()  | Field       |
| z.bool() |      | Bool        |
