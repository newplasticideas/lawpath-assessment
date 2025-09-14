export type StateAbbr = (typeof import("./constants").VALID_STATES)[number];

export type Coordinates = { lat: number; lng: number };

export type AddressInput = {
  postcode: string;
  suburb: string;
  state: StateAbbr;
};

export type AddressValidation = {
  ok: boolean;
  message: string;
  coordinates?: Coordinates;
};
