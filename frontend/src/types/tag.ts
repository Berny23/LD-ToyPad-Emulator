type TagType = 'character' | 'vehicle'

type ToyTag = {
  name: string
  id: number
  uid: string
  type: TagType
  vehicleUpgradesP23: number
  vehicleUpgradesP25: number
  index: number
}

type TagMap = {
  1: ToyTag | null
  2: ToyTag | null
  3: ToyTag | null
  4: ToyTag | null
  5: ToyTag | null
  6: ToyTag | null
}

export type { TagMap, ToyTag }
