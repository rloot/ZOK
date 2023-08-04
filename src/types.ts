export type SlotValue = {
  name: string,
  slot: number,
  size: number,
  offset: number
}

export type Slot = {[key: string]: SlotValue}

export type StorageLayout = SlotValue[][]

export type GeneratorOptions = {
  packed: boolean,
  accessors: boolean
}