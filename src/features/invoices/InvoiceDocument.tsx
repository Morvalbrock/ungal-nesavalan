import { Document, Page, StyleSheet, Text, View, Image } from "@react-pdf/renderer";
import type { Order } from "@/types/order";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, color: "#1a1a1a", fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  brandLogo: { width: 52, height: 52, objectFit: "contain", borderRadius: 4 },
  brand: { fontSize: 18, fontWeight: 700, color: "#1a1a1a" },
  brandTag: { fontSize: 9, color: "#666", marginTop: 2 },
  invoiceLabel: { fontSize: 14, fontWeight: 700, color: "#7a1e28" },
  meta: { fontSize: 9, color: "#666", marginTop: 3 },
  hr: { borderBottomWidth: 1, borderBottomColor: "#e5e5e5", marginVertical: 12 },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#666", marginBottom: 4 },
  row: { flexDirection: "row" },
  colName: { flex: 3 },
  colQty: { flex: 0.7, textAlign: "right" },
  colUnit: { flex: 1.2, textAlign: "right" },
  colTotal: { flex: 1.2, textAlign: "right" },
  th: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#666",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingBottom: 6,
    marginBottom: 6
  },
  itemRow: { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  itemName: { fontSize: 10 },
  itemVariant: { fontSize: 8, color: "#666", marginTop: 2 },
  totals: { marginTop: 12, alignSelf: "flex-end", width: 240 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  totalLabel: { color: "#666" },
  grandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
    fontSize: 12,
    fontWeight: 700
  },
  payBox: {
    marginTop: 16,
    alignSelf: "flex-end",
    width: 300,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    padding: 10,
    borderRadius: 2
  },
  payTitle: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#666",
    marginBottom: 6
  },
  payRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    fontSize: 10
  },
  payNote: { fontSize: 8, color: "#888", marginTop: 2 },
  paySubTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    fontSize: 10,
    fontWeight: 700
  },
  payStatusPaid: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#065f46",
    color: "#fff",
    textAlign: "center",
    fontSize: 9,
    letterSpacing: 1,
    textTransform: "uppercase",
    borderRadius: 2
  },
  payStatusPending: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#92400e",
    color: "#fff",
    textAlign: "center",
    fontSize: 9,
    letterSpacing: 1,
    textTransform: "uppercase",
    borderRadius: 2
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 36,
    right: 36,
    fontSize: 8,
    color: "#888",
    textAlign: "center"
  }
});

function inr(paise: number) {
  return `INR ${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export interface InvoiceProps {
  order: Order;
  brand: {
    name: string;
    tagline: string;
    supportEmail: string;
    logoDataUrl?: string;
  };
}

function PaymentBreakdown({ order }: { order: Order }) {
  const total = order.totalPaise;
  const isCod = order.paymentMode === "cod";
  const collected = isCod && Boolean(order.codCollectedAt);
  const deposit = isCod ? order.codDepositPaise ?? order.amountPaidPaise ?? 0 : 0;
  const codPortion = isCod ? Math.max(0, total - deposit) : 0;
  const paidSoFar = isCod ? (collected ? total : deposit) : total;
  const balance = Math.max(0, total - paidSoFar);

  return (
    <View style={styles.payBox}>
      <Text style={styles.payTitle}>Payment Summary</Text>

      <View style={styles.payRow}>
        <Text style={styles.totalLabel}>Payment mode</Text>
        <Text>{isCod ? "Cash on Delivery" : "Prepaid Online"}</Text>
      </View>

      {isCod ? (
        <>
          <View style={styles.payRow}>
            <Text style={styles.totalLabel}>Deposit paid online</Text>
            <Text>{inr(deposit)}</Text>
          </View>
          {collected ? (
            <View style={styles.payRow}>
              <Text style={styles.totalLabel}>
                COD collected (cash){order.codCollectedAt ? ` · ${formatDate(order.codCollectedAt)}` : ""}
              </Text>
              <Text>{inr(codPortion)}</Text>
            </View>
          ) : (
            <View style={styles.payRow}>
              <Text style={styles.totalLabel}>COD pending (on delivery)</Text>
              <Text>{inr(codPortion)}</Text>
            </View>
          )}
          <View style={styles.paySubTotalRow}>
            <Text>{collected ? "Total received" : "Received so far"}</Text>
            <Text>{inr(paidSoFar)}</Text>
          </View>
          <View style={styles.payRow}>
            <Text style={styles.totalLabel}>Balance</Text>
            <Text>{inr(balance)}</Text>
          </View>
          {balance === 0 ? (
            <Text style={styles.payStatusPaid}>Paid in full</Text>
          ) : (
            <Text style={styles.payStatusPending}>
              Collect {inr(balance)} in cash on delivery
            </Text>
          )}
        </>
      ) : (
        <>
          <View style={styles.payRow}>
            <Text style={styles.totalLabel}>Paid online</Text>
            <Text>{inr(total)}</Text>
          </View>
          <View style={styles.paySubTotalRow}>
            <Text>Total received</Text>
            <Text>{inr(total)}</Text>
          </View>
          <Text style={styles.payStatusPaid}>Paid in full</Text>
        </>
      )}
    </View>
  );
}

export function InvoiceDocument({ order, brand }: InvoiceProps) {
  const a = order.addressSnapshot;
  return (
    <Document title={`Invoice ${order.orderNumber}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            {brand.logoDataUrl ? (
              <Image src={brand.logoDataUrl} style={styles.brandLogo} />
            ) : null}
            <View>
              <Text style={styles.brand}>{brand.name}</Text>
              <Text style={styles.brandTag}>{brand.tagline}</Text>
            </View>
          </View>
          <View style={{ textAlign: "right" }}>
            <Text style={styles.invoiceLabel}>Tax Invoice</Text>
            <Text style={styles.meta}>Order {order.orderNumber}</Text>
            <Text style={styles.meta}>{new Date(order.createdAt).toLocaleDateString("en-IN")}</Text>
          </View>
        </View>

        <View style={styles.hr} />

        <View style={{ flexDirection: "row", gap: 40 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text>{a.fullName}</Text>
            <Text>{a.line1}{a.line2 ? `, ${a.line2}` : ""}</Text>
            <Text>{a.city}, {a.state} {a.pincode}</Text>
            <Text>{a.country}</Text>
            <Text style={{ color: "#666", marginTop: 4 }}>{a.phone}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Status</Text>
            <Text style={{ textTransform: "capitalize" }}>{order.status.replace("_", " ")}</Text>
            {order.paymentId && (
              <Text style={styles.meta}>Payment ref: {order.paymentId}</Text>
            )}
            {order.paymentMode && (
              <Text style={styles.meta}>
                Payment Mode: {order.paymentMode === "cod" ? "Cash on Delivery" : "Prepaid Online"}
              </Text>
            )}
            {order.trackingId && (
              <Text style={styles.meta}>
                Tracking: {order.trackingId} ({order.courier ?? "Courier"})
              </Text>
            )}
          </View>
        </View>

        <View style={{ marginTop: 20 }}>
          <View style={[styles.row, styles.th]}>
            <Text style={styles.colName}>Item</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colUnit}>Unit</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>

          {order.items.map((i) => (
            <View key={i.id} style={[styles.row, styles.itemRow]}>
              <View style={styles.colName}>
                <Text style={styles.itemName}>{i.productNameSnapshot}</Text>
                <Text style={styles.itemVariant}>{i.variantLabelSnapshot}</Text>
              </View>
              <Text style={styles.colQty}>{i.quantity}</Text>
              <Text style={styles.colUnit}>{inr(i.unitPricePaise)}</Text>
              <Text style={styles.colTotal}>{inr(i.unitPricePaise * i.quantity)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text>{inr(order.subtotalPaise)}</Text>
          </View>
          {order.discountPaise > 0 && order.couponSnapshot && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount ({order.couponSnapshot.code})</Text>
              <Text>-{inr(order.discountPaise)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Shipping</Text>
            <Text>{order.shippingPaise === 0 ? "Free" : inr(order.shippingPaise)}</Text>
          </View>
          <View style={styles.grandRow}>
            <Text>Total</Text>
            <Text>{inr(order.totalPaise)}</Text>
          </View>
        </View>

        <PaymentBreakdown order={order} />

        <View style={styles.footer}>
          <Text>Thank you for choosing Ungal Nesavalan — honoring traditional handloom weavers.</Text>
          <Text style={{ marginTop: 2 }}>Questions? Contact our atelier support at {brand.supportEmail}</Text>
        </View>
      </Page>
    </Document>
  );
}
