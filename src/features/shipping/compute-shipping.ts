import type { ShippingCharge, ShippingDefaults } from "@/types/shipping-charge";

export interface ShippingCalculation {
  shippingPaise: number;
  freeAbovePaise: number | null;
  qualifiesForFreeShipping: boolean;
  freeShippingRemainingPaise: number;
  usedFallback: boolean;
}

// Single source of truth for shipping rate.
// state == null → 0 (caller renders "Calculated at checkout").
// Active row for the state wins; otherwise the admin-set defaults apply
// and usedFallback=true so the UI can surface a contact-support notice.
export function computeShipping(opts: {
  state: string | null;
  subtotalPaise: number;
  charges: ShippingCharge[];
  defaults: ShippingDefaults;
}): ShippingCalculation {
  if (opts.state == null || opts.subtotalPaise <= 0) {
    return {
      shippingPaise: 0,
      freeAbovePaise: null,
      qualifiesForFreeShipping: false,
      freeShippingRemainingPaise: 0,
      usedFallback: false
    };
  }

  const match = opts.charges.find((c) => c.state === opts.state && c.active);
  const chargePaise = match ? match.chargePaise : opts.defaults.defaultChargePaise;
  const freeAbovePaise = match ? match.freeAbovePaise : opts.defaults.defaultFreeAbovePaise;
  const usedFallback = !match;

  const qualifies =
    freeAbovePaise !== null && freeAbovePaise >= 0 && opts.subtotalPaise >= freeAbovePaise;
  const shippingPaise = qualifies ? 0 : chargePaise;
  const freeShippingRemainingPaise =
    freeAbovePaise !== null ? Math.max(0, freeAbovePaise - opts.subtotalPaise) : 0;

  return {
    shippingPaise,
    freeAbovePaise,
    qualifiesForFreeShipping: qualifies,
    freeShippingRemainingPaise,
    usedFallback
  };
}
