import { Tagtypes } from "src/enums/TagTypes";

export interface Toytag {
  name: string;
  id: number;
  uid: string;
  index: number;
  type: Tagtypes;
  vehicleUpgradesP23?: number;
  vehicleUpgradesP25?: number;
}
