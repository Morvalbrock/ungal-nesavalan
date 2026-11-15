import type {
  ShippingCharge,
  ShippingChargeInput,
  ShippingDefaults,
  ShippingDefaultsInput
} from "@/types/shipping-charge";
import { mutateCollection, newId, nowIso, readCollection, writeCollection } from "@/server/db/json-store";

export interface ShippingChargesRepository {
  list(): Promise<ShippingCharge[]>;
  findByState(state: string): Promise<ShippingCharge | null>;
  bulkUpsert(entries: ShippingChargeInput[]): Promise<ShippingCharge[]>;
  getDefaults(): Promise<ShippingDefaults>;
  setDefaults(input: ShippingDefaultsInput): Promise<ShippingDefaults>;
}

const COLLECTION = "shipping-charges";
const DEFAULTS_COLLECTION = "shipping-defaults";

const BUILTIN_DEFAULTS: ShippingDefaults = {
  defaultChargePaise: 9900,
  defaultFreeAbovePaise: 500000,
  updatedAt: "1970-01-01T00:00:00.000Z"
};

export const jsonShippingChargesRepo: ShippingChargesRepository = {
  async list() {
    const rows = await readCollection<ShippingCharge>(COLLECTION);
    return rows.sort((a, b) => a.state.localeCompare(b.state));
  },
  async findByState(state) {
    const rows = await readCollection<ShippingCharge>(COLLECTION);
    return rows.find((r) => r.state === state) ?? null;
  },
  async bulkUpsert(entries) {
    let next: ShippingCharge[] = [];
    await mutateCollection<ShippingCharge>(COLLECTION, [], (rows) => {
      const byState = new Map(rows.map((r) => [r.state, r]));
      const timestamp = nowIso();
      next = entries.map((input) => {
        const existing = byState.get(input.state);
        return {
          id: existing?.id ?? newId("ship"),
          state: input.state,
          chargePaise: input.chargePaise,
          freeAbovePaise: input.freeAbovePaise,
          active: input.active,
          updatedAt: timestamp
        };
      });
      return next;
    });
    return next;
  },
  async getDefaults() {
    const rows = await readCollection<ShippingDefaults>(DEFAULTS_COLLECTION);
    return rows[0] ?? BUILTIN_DEFAULTS;
  },
  async setDefaults(input) {
    const record: ShippingDefaults = {
      defaultChargePaise: input.defaultChargePaise,
      defaultFreeAbovePaise: input.defaultFreeAbovePaise,
      updatedAt: nowIso()
    };
    await writeCollection<ShippingDefaults>(DEFAULTS_COLLECTION, [record]);
    return record;
  }
};
