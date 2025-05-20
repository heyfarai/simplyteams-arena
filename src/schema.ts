import { list } from "@keystone-6/core";
import {
  relationship,
  text,
  integer,
  select,
  timestamp,
} from "@keystone-6/core/fields";

export const Payment = list({
  fields: {
    user: relationship({ ref: "User.payments", many: false }),
    booking: relationship({ ref: "Enrollment.payment", many: false }),
    stripePaymentIntentId: text({ isIndexed: "unique" }),
    amount: integer(),
    currency: text({ defaultValue: "usd" }),
    status: select({
      options: [
        { label: "Pending", value: "pending" },
        { label: "Succeeded", value: "succeeded" },
        { label: "Failed", value: "failed" },
        { label: "Refunded", value: "refunded" },
      ],
      defaultValue: "pending",
      ui: { displayMode: "segmented-control" },
    }),
    createdAt: timestamp({ defaultValue: { kind: "now" } }),
    refundedAt: timestamp(),
    refunds: relationship({ ref: "Refund.payment", many: true }),
    invoice: relationship({ ref: "Invoice.payment", many: false }),
  },
});

export const Invoice = list({
  fields: {
    user: relationship({ ref: "User.invoices", many: false }),
    payment: relationship({ ref: "Payment.invoice", many: false }),
    stripeInvoiceId: text({ isIndexed: "unique" }),
    amount: integer(),
    status: select({
      options: [
        { label: "Draft", value: "draft" },
        { label: "Open", value: "open" },
        { label: "Paid", value: "paid" },
        { label: "Uncollectible", value: "uncollectible" },
        { label: "Void", value: "void" },
      ],
      defaultValue: "open",
      ui: { displayMode: "segmented-control" },
    }),
    createdAt: timestamp({ defaultValue: { kind: "now" } }),
  },
});

export const Refund = list({
  fields: {
    payment: relationship({ ref: "Payment.refunds", many: false }),
    stripeRefundId: text({ isIndexed: "unique" }),
    amount: integer(),
    status: select({
      options: [
        { label: "Pending", value: "pending" },
        { label: "Succeeded", value: "succeeded" },
        { label: "Failed", value: "failed" },
      ],
      defaultValue: "pending",
      ui: { displayMode: "segmented-control" },
    }),
    createdAt: timestamp({ defaultValue: { kind: "now" } }),
  },
});

export const User = list({
  fields: {
    payments: relationship({ ref: "Payment.user", many: true }),
    invoices: relationship({ ref: "Invoice.user", many: true }),
  },
});

export const Enrollment = list({
  fields: {
    payment: relationship({ ref: "Payment.booking", many: false }),
  },
});
