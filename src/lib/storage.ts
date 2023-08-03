import { UInt240 } from "./int240.js";
import { Bool, Field, Provable, UInt64 } from "snarkyjs";

export function __read(currentValue: Field, offset: number, size: number): Field {
  let shiftedOffset = new Field(1 << offset).seal();
  let shiftedSize = new Field(1 << size).seal();
  return _read(currentValue, shiftedOffset, shiftedSize);
}

export function _read(currentValue: Field, offset: Field, size: Field): Field {
  const w = Provable.witness(Field, () => {
    // dirty = 0xffdeadffff / x10000 => 0xffdead
    const dirtyValue = UInt240.from(currentValue).div(UInt240.from(offset));
    const q = dirtyValue.div(UInt240.from(size));
    const p = q.mul(UInt240.from(size));
    // value = 0xffdead % 0x10000 <=> r = 0xffdead - (q * 0x10000) => 0xdead
    const value = dirtyValue.sub(p);
    return value.toFields()[0];
  });
  return w;
}

// export function get(currentValue: Field, offset: number , size: Field): Field {
export function read(currentValue: Field, offset: Field, size: Field): Field {
  let shiftedOffset = new Field(1n << offset.toBigInt()).seal();
  let shiftedSize = new Field(1n << size.toBigInt()).seal();
  let higherBits = Provable.witness(
    Field,
    () => new Field(currentValue.toBigInt() / shiftedOffset.toBigInt())
  );
  let q = Provable.witness(
    Field,
    () => new Field(higherBits.toBigInt() / shiftedSize.toBigInt())
  );

  let rest = q.mul(size);
  // TODO: assert q * size + rest == higherBits
  let value = higherBits.sub(rest);

  return value;
}

// console.log(`setting new ${value.toBigInt()} in offset ${offset.toBigInt()}`)
export function _set(
  currentField: Field,
  value: Field,
  offset: Field,
  size: Field
): Field {
  const newField = Provable.witness(Field, () => {
    const shiftedValue = value.mul(offset);
    // console.log(`shifted: ${value.toBigInt()} * ${offset.toBigInt()} = ${shiftedValue.toBigInt()}`);
    const currentValue = _read(currentField, offset, size);
    // console.log(`current: ${currentValue.toBigInt()}`);
    const newValue = currentField.sub(currentValue).add(shiftedValue);
    // console.log(`new: ${newValue.toBigInt()}`);
    return newValue;
  });
  return newField;
}

export function set(
  currentField: Field,
  value: Field,
  offset: Field,
  size: Field
): Field {
  const newField = Provable.witness(Field, () => {
    const shiftedValue = UInt240.from(value).mul(offset);
    // console.log(`shifted: ${value.toBigInt()} * ${off1set.toBigInt()} = ${shiftedValue.toBigInt()}`);
    const currentValue = _read(currentField, offset, size);
    // console.log(`current: ${currentValue.toBigInt()}`);
    const newValue = UInt240.from(currentField)
      .sub(currentValue)
      .add(shiftedValue);
    // console.log(`new: ${newValue.toBigInt()}`);
    return newValue.toFields()[0];
  });
  return newField;
}

export function _set240(
  currentField: Field,
  value: Field,
  offset: Field,
  size: Field
): Field {

  const newField = Provable.witness(Field, () => {

    let shiftedOffset = new Field(1n << offset.toBigInt()).seal();
    let shiftedSize = new Field(1n << size.toBigInt()).seal();

    const shiftedValue = UInt240.from(value).mul(shiftedOffset);
    // console.log(`shifted: ${value.toBigInt()} * ${offset_.toBigInt()} = ${shiftedValue.toBigInt()}`);
    const currentValue = _read(currentField, shiftedOffset, shiftedSize);
    // console.log(`current: ${currentValue.toBigInt()}`);
    const newValue = UInt240.from(currentField)
      .sub(currentValue)
      .add(shiftedValue);
    // console.log(`new: ${newValue.toBigInt()}`);
    return newValue.toFields()[0];
  });
  
  return newField;
}

export function __set240(
  currentField: Field,
  value: Field,
  offset: number,
  size: number
): Field {
  let shiftedOffset = new Field(1 << offset).seal();
  let shiftedSize = new Field(1 << size).seal();
  return set(currentField, value, shiftedOffset, shiftedSize);
}

// export function pow2(power: number) {
//   const OPERATION_COUNT = 32;
//   let answer = new Field(1);
//   let notYetReachedEnd = Bool(true);
//   for (let i = 0; i < OPERATION_COUNT; i++) {
//     notYetReachedEnd = Provable.if(
//         Bool.or(notYetReachedEnd.not(), new Field(i).equals(power)),
//         Bool(false),
//         Bool(true)
//     );
//     answer = answer.mul(
//       Provable.if(notYetReachedEnd, new Field(2), new Field(1))
//     );
//   }
//   return answer;
// }

export function _getBool(currentValue: Field, offset: Field): Bool {
  const w = Provable.witness(Bool, () => {
    // console.log('_get', currentValue.toString(), offset.toString(), size.toString())
    return UInt64.from(currentValue)
      .div(UInt64.from(offset)) // discard the lower bits
      .div(2)
      .equals(UInt64.from(1)); // check of the first bit is set
  });

  return w;
}
