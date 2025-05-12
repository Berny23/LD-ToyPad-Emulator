interface Toytag {
  name: string;
  id: number;
  uid: string;
  index: number | String; //TODO: This should only be an integer
  type: Tagtypes;
  vehicleUpgradesP23?: number;
  vehicleUpgradesP25?: number;
}
