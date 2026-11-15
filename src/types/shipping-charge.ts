export interface ShippingCharge {
  id: string;
  state: string;
  chargePaise: number;
  freeAbovePaise: number | null;
  active: boolean;
  updatedAt: string;
}

export interface ShippingDefaults {
  defaultChargePaise: number;
  defaultFreeAbovePaise: number | null;
  updatedAt: string;
}

export interface ShippingChargeInput {
  state: string;
  chargePaise: number;
  freeAbovePaise: number | null;
  active: boolean;
}

export interface ShippingDefaultsInput {
  defaultChargePaise: number;
  defaultFreeAbovePaise: number | null;
}
