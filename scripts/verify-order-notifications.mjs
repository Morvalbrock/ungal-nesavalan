import assert from "node:assert";
import { adminNewOrderEmail, orderConfirmationEmail } from "../src/features/mail/templates.ts";

console.log("=== STARTING ORDER EMAIL & SUPPORT VERIFICATION TEST ===");

const sampleOrder = {
  id: "ord_test_12345",
  orderNumber: "UN-2026-00042",
  userId: "usr_test_1",
  items: [
    {
      id: "item_1",
      orderId: "ord_test_12345",
      productId: "prd_kanjivaram_crimson",
      variantId: "var_crimson_red",
      productNameSnapshot: "Crimson Korvai Kanjivaram Silk Saree",
      variantLabelSnapshot: "Sindhoor Red / Pure Zari",
      imageSnapshot: "/images/products/kanjivaram-1.jpg",
      unitPricePaise: 2450000,
      quantity: 1
    }
  ],
  addressSnapshot: {
    fullName: "Priya Sundaram",
    line1: "12, Temple View Avenue",
    line2: "Gandhi Nagar",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600020",
    country: "India",
    phone: "+91 98765 43210"
  },
  status: "paid",
  subtotalPaise: 2450000,
  shippingPaise: 0,
  taxPaise: 0,
  discountPaise: 0,
  totalPaise: 2450000,
  currency: "INR",
  paymentMode: "prepaid",
  amountPaidPaise: 2450000,
  amountDuePaise: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const customer = {
  name: "Priya Sundaram",
  email: "priya.sundaram@example.com",
  phone: "+91 98765 43210"
};

// 1. Verify Admin New Order Email
console.log("Testing adminNewOrderEmail...");
const adminMail = adminNewOrderEmail(sampleOrder, customer);
assert(adminMail.subject.includes("UN-2026-00042"), "Subject must contain order number");
assert(adminMail.subject.includes("Priya Sundaram"), "Subject must contain customer name");
assert(adminMail.html.includes("NEW ORDER RECEIVED"), "HTML must indicate new order received");
assert(adminMail.html.includes("priya.sundaram@example.com"), "HTML must contain customer email");
assert(adminMail.html.includes("+91 98765 43210"), "HTML must contain customer phone");
assert(adminMail.html.includes("12, Temple View Avenue"), "HTML must contain address line 1");
assert(adminMail.html.includes("Chennai"), "HTML must contain city");
assert(adminMail.html.includes("Crimson Korvai Kanjivaram Silk Saree"), "HTML must contain product title");
assert(adminMail.html.includes("/admin/orders/ord_test_12345"), "HTML must contain admin panel link");
assert(adminMail.html.includes("ungalnesavalan01@gmail.com"), "Footer must include official support email");
assert(adminMail.html.includes("+91 88258 10897"), "Footer must include official support phone");
console.log("✓ adminNewOrderEmail passed all assertions!");

// 2. Verify Customer Order Confirmation Email
console.log("Testing orderConfirmationEmail...");
const customerMail = orderConfirmationEmail(sampleOrder, customer.name);
assert(customerMail.subject.includes("UN-2026-00042"), "Subject must contain order number");
assert(customerMail.html.includes("Priya Sundaram"), "HTML must greet customer");
assert(customerMail.html.includes("Crimson Korvai Kanjivaram Silk Saree"), "HTML must contain ordered saree");
assert(customerMail.html.includes("12, Temple View Avenue"), "HTML must contain delivery address");
assert(customerMail.html.includes("ungalnesavalan01@gmail.com"), "HTML must provide support email");
assert(customerMail.html.includes("+91 88258 10897"), "HTML must provide support phone number");
console.log("✓ orderConfirmationEmail passed all assertions!");

console.log("=== ALL NOTIFICATION & SUPPORT TESTS PASSED SUCCESSFULLY! ===");
