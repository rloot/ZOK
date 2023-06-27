import { SlotValue, StorageLayout } from "../types";

export function pack(numbers: [string, number][]): [string, number][][] {
    const result: [string, number][][] = [];
    let currentSlot: [string, number][] = [];
    let sum = 0;
  
    for (const [name, bits] of numbers) {
      if (sum + bits > 256) {
        result.push(currentSlot);
        currentSlot = [];
        sum = 0;
      }
  
      currentSlot.push([name, bits]);
      sum += bits;
    }
  
    if (currentSlot.length > 0) {
      result.push(currentSlot);
    }
  
    return result;
}

export function getPackedProps(properties: any): {[key: string]: SlotValue} {
  const packedProps = pack(
    // replace 64 with correct data type bit size
    Object.keys(properties).map((name) => [name, 64])
  )

  const fields = {}
  let currentSlot = 0
  for (const slot of packedProps) {
    // console.log(slot)
    let offset = 0
    for (const [name, bits] of slot) {
      fields[name] = {
        slot: currentSlot,
        size: bits,
        offset
      }
      offset += bits
    }
    currentSlot += 1
  }

  return fields
}

export function getStorageLayout(properties: any): StorageLayout {
  const layout = []

  const packedProps = pack(
    // replace 64 with correct data type bit size
    Object.keys(properties).map((name) => [name, 64])
  )

  let currentSlot = 0

  for (const slot of packedProps) {
    // console.log(slot)
    let offset = 0
    const v = []
    for (const [name, bits] of slot) {
      v.push({
        name,
        slot: currentSlot,
        size: bits,
        offset
      })
      offset += bits
    }
    layout.push(v)
    currentSlot += 1
  }

  return layout
}

function getBitSize(num: number): number {
    return Math.ceil(Math.log2(num + 1));
}

function maxValue(bitSize: number): number {
    return (2 ** bitSize) - 1;
}