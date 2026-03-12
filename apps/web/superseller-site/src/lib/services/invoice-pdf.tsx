/**
 * Invoice PDF Generator — SuperSeller Agency
 * Uses @react-pdf/renderer to produce branded PDF invoices.
 * Call generateInvoicePdf(data) → returns Buffer.
 */
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Font,
} from "@react-pdf/renderer";

// ── Types ──

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number; // in dollars
}

export interface InvoiceData {
  invoiceNumber: string; // e.g. INV-2026-0001
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  // Biller
  companyName?: string;
  companyAddress?: string[];
  companyEmail?: string;
  companyPhone?: string;
  // Customer
  customerName: string;
  customerAddress?: string[];
  customerEmail?: string;
  // Line items
  lineItems: InvoiceLineItem[];
  // Optional
  notes?: string;
  currency?: string; // default USD
  taxRate?: number; // e.g. 0 for no tax
  status?: "paid" | "unpaid" | "overdue";
}

// ── Styles ──

const GOLD = "#c9a96e";
const DARK = "#1a1a2e";
const GRAY = "#6b7280";
const LIGHT_BG = "#fafaf8";

const s = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: DARK,
    backgroundColor: "#ffffff",
  },
  // Header
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  brandCol: {},
  brandName: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    letterSpacing: 0.5,
  },
  brandSub: {
    fontSize: 8,
    color: GOLD,
    letterSpacing: 2,
    marginTop: 3,
    textTransform: "uppercase" as const,
  },
  invoiceTitle: {
    fontSize: 32,
    fontFamily: "Helvetica-Bold",
    color: GOLD,
    textAlign: "right" as const,
  },
  invoiceNumber: {
    fontSize: 10,
    color: GRAY,
    textAlign: "right" as const,
    marginTop: 4,
  },
  // Gold accent line
  accentLine: {
    height: 2,
    backgroundColor: GOLD,
    marginBottom: 28,
  },
  // Info rows
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  infoCol: {
    width: "48%",
  },
  infoLabel: {
    fontSize: 7,
    color: GOLD,
    letterSpacing: 1.5,
    textTransform: "uppercase" as const,
    marginBottom: 6,
    fontFamily: "Helvetica-Bold",
  },
  infoText: {
    fontSize: 10,
    color: DARK,
    lineHeight: 1.6,
  },
  infoBold: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: DARK,
  },
  // Date row
  dateRow: {
    flexDirection: "row",
    gap: 40,
    marginBottom: 28,
  },
  dateBlock: {},
  dateLabel: {
    fontSize: 7,
    color: GOLD,
    letterSpacing: 1.5,
    textTransform: "uppercase" as const,
    marginBottom: 4,
    fontFamily: "Helvetica-Bold",
  },
  dateValue: {
    fontSize: 10,
    color: DARK,
  },
  // Table
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: DARK,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  tableHeaderText: {
    fontSize: 8,
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0ed",
  },
  tableRowAlt: {
    backgroundColor: LIGHT_BG,
  },
  colDesc: { width: "50%" },
  colQty: { width: "15%", textAlign: "center" as const },
  colUnit: { width: "17.5%", textAlign: "right" as const },
  colTotal: { width: "17.5%", textAlign: "right" as const },
  cellText: {
    fontSize: 10,
    color: DARK,
  },
  cellBold: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: DARK,
  },
  // Totals
  totalsSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  totalsBox: {
    width: 220,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  totalLabel: {
    fontSize: 10,
    color: GRAY,
  },
  totalValue: {
    fontSize: 10,
    color: DARK,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: DARK,
    borderRadius: 4,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  grandTotalValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: GOLD,
  },
  // Status badge
  statusBadge: {
    position: "absolute" as const,
    top: 120,
    right: 48,
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 12,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    textTransform: "uppercase" as const,
  },
  statusPaid: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  statusUnpaid: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  statusOverdue: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  // Notes
  notes: {
    marginTop: 30,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0ed",
  },
  notesLabel: {
    fontSize: 7,
    color: GOLD,
    letterSpacing: 1.5,
    textTransform: "uppercase" as const,
    marginBottom: 6,
    fontFamily: "Helvetica-Bold",
  },
  notesText: {
    fontSize: 9,
    color: GRAY,
    lineHeight: 1.6,
  },
  // Footer
  footer: {
    position: "absolute" as const,
    bottom: 36,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#f0f0ed",
    paddingTop: 12,
  },
  footerText: {
    fontSize: 7,
    color: GRAY,
  },
  footerBrand: {
    fontSize: 7,
    color: GOLD,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
  },
});

// ── Helpers ──

function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ── Component ──

function InvoiceDocument({ data }: { data: InvoiceData }) {
  const currency = data.currency || "USD";
  const subtotal = data.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const tax = data.taxRate ? subtotal * data.taxRate : 0;
  const total = subtotal + tax;

  const company = {
    name: data.companyName || "SuperSeller Agency",
    address: data.companyAddress || [
      "Dallas, TX",
      "United States",
    ],
    email: data.companyEmail || "shai@superseller.agency",
    phone: data.companyPhone || "",
  };

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Status badge */}
        {data.status && (
          <View
            style={[
              s.statusBadge,
              data.status === "paid"
                ? s.statusPaid
                : data.status === "overdue"
                  ? s.statusOverdue
                  : s.statusUnpaid,
            ]}
          >
            <Text>{data.status.toUpperCase()}</Text>
          </View>
        )}

        {/* Header */}
        <View style={s.headerRow}>
          <View style={s.brandCol}>
            <Text style={s.brandName}>{company.name}</Text>
            <Text style={s.brandSub}>AI-Powered Marketing Agency</Text>
          </View>
          <View>
            <Text style={s.invoiceTitle}>INVOICE</Text>
            <Text style={s.invoiceNumber}>{data.invoiceNumber}</Text>
          </View>
        </View>

        {/* Gold accent */}
        <View style={s.accentLine} />

        {/* From / To */}
        <View style={s.infoRow}>
          <View style={s.infoCol}>
            <Text style={s.infoLabel}>From</Text>
            <Text style={s.infoBold}>{company.name}</Text>
            {company.address.map((line, i) => (
              <Text key={i} style={s.infoText}>
                {line}
              </Text>
            ))}
            {company.email && (
              <Text style={s.infoText}>{company.email}</Text>
            )}
            {company.phone && (
              <Text style={s.infoText}>{company.phone}</Text>
            )}
          </View>
          <View style={s.infoCol}>
            <Text style={s.infoLabel}>Bill To</Text>
            <Text style={s.infoBold}>{data.customerName}</Text>
            {data.customerAddress?.map((line, i) => (
              <Text key={i} style={s.infoText}>
                {line}
              </Text>
            ))}
            {data.customerEmail && (
              <Text style={s.infoText}>{data.customerEmail}</Text>
            )}
          </View>
        </View>

        {/* Dates */}
        <View style={s.dateRow}>
          <View style={s.dateBlock}>
            <Text style={s.dateLabel}>Issue Date</Text>
            <Text style={s.dateValue}>{formatDate(data.issueDate)}</Text>
          </View>
          <View style={s.dateBlock}>
            <Text style={s.dateLabel}>Due Date</Text>
            <Text style={s.dateValue}>{formatDate(data.dueDate)}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderText, s.colDesc]}>Description</Text>
            <Text style={[s.tableHeaderText, s.colQty]}>Qty</Text>
            <Text style={[s.tableHeaderText, s.colUnit]}>Unit Price</Text>
            <Text style={[s.tableHeaderText, s.colTotal]}>Amount</Text>
          </View>
          {data.lineItems.map((item, idx) => (
            <View
              key={idx}
              style={[s.tableRow, idx % 2 === 1 ? s.tableRowAlt : {}]}
            >
              <Text style={[s.cellText, s.colDesc]}>{item.description}</Text>
              <Text style={[s.cellText, s.colQty]}>{item.quantity}</Text>
              <Text style={[s.cellText, s.colUnit]}>
                {formatCurrency(item.unitPrice, currency)}
              </Text>
              <Text style={[s.cellBold, s.colTotal]}>
                {formatCurrency(item.quantity * item.unitPrice, currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={s.totalsSection}>
          <View style={s.totalsBox}>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Subtotal</Text>
              <Text style={s.totalValue}>
                {formatCurrency(subtotal, currency)}
              </Text>
            </View>
            {tax > 0 && (
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>
                  Tax ({((data.taxRate || 0) * 100).toFixed(0)}%)
                </Text>
                <Text style={s.totalValue}>
                  {formatCurrency(tax, currency)}
                </Text>
              </View>
            )}
            <View style={s.grandTotalRow}>
              <Text style={s.grandTotalLabel}>Total Due</Text>
              <Text style={s.grandTotalValue}>
                {formatCurrency(total, currency)}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {data.notes && (
          <View style={s.notes}>
            <Text style={s.notesLabel}>Notes</Text>
            <Text style={s.notesText}>{data.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            {data.invoiceNumber} &bull; Generated{" "}
            {new Date().toLocaleDateString("en-US")}
          </Text>
          <Text style={s.footerBrand}>SUPERSELLER AGENCY</Text>
        </View>
      </Page>
    </Document>
  );
}

// ── Public API ──

export async function generateInvoicePdf(
  data: InvoiceData
): Promise<Buffer> {
  const buf = await renderToBuffer(
    <InvoiceDocument data={data} />
  );
  return Buffer.from(buf);
}
