# zok

ZOK is a snakyJs utility that allows developers to express and validate the structure of their data in a reusable format.

## Install
```
yarn add zok
```

## Run PoC

```
yarn start
```

## How to use
1. Describe schemas with zod under the root folder in cases.ts
2. Execute CLI 

Generate a file for every zod schema case.
```ts
yarn zok 
```
Specify a single case.
```ts
zok file_name zod_schema_case
```

3. Import the generated Structs into you ZkDapp

```ts
import FieldCase from "structs/FieldCase.ts/
```

## Example

### Zod schema
```ts
export const DateStruct = z.object({
  birthday: z.date(),
  minDate: z.date().min(new Date('1970-01-02')),
  maxDate: z.date().max(new Date('1972-01-02')),
});
```

### generated struct
```ts
export class date extends Struct({
  birthday: Field,
  minDate: Field,
  maxDate: Field
}) {
  constructor(birthday: Field, minDate: Field, maxDate: Field) {
    super({ birthday, minDate, maxDate });
    this.check();
  }
  public check() {
    this.minDate.assertGreaterThanOrEqual(86400000, "minDate must be greater or equal than 86400000")
    this.maxDate.assertLessThanOrEqual(63158400000, "maxDate must be less or equal than 63158400000")
  }
  _assert(expr: unknown, msg?: string) {
    if (!expr)
      throw new Error(msg);
  }
}

```
