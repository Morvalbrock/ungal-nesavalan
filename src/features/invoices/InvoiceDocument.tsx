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

export interface InvoiceProps {
  order: Order;
  brand: {
    name: string;
    tagline: string;
    supportEmail: string;
    logoDataUrl?: string;
  };
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

        <View style={styles.footer}>
          <Text>Thank you for choosing Ungal Nesavalan — honoring traditional handloom weavers.</Text>
          <Text style={{ marginTop: 2 }}>Questions? Contact our atelier support at {brand.supportEmail}</Text>
        </View>
      </Page>
    </Document>
  );
}
