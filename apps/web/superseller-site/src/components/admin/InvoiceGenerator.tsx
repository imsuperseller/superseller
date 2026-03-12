"use client";

import React, { useState, useEffect } from "react";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Tenant {
  id: string;
  slug: string;
  name: string;
}

const PRESET_ITEMS: Record<string, LineItem[]> = {
  "elite-pro-remodeling": [
    {
      description: "Monthly AI Marketing Package — Competitor Ad Research, Content Strategy, Social Media Management",
      quantity: 1,
      unitPrice: 2000,
    },
  ],
};

export default function InvoiceGenerator() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [notes, setNotes] = useState("Payment is due within 30 days of the invoice date. Thank you for your business.");
  const [status, setStatus] = useState<"unpaid" | "paid" | "overdue">("unpaid");
  const [storeInR2, setStoreInR2] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ url?: string; invoiceNumber?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((data) => {
        if (data.tenants) setTenants(data.tenants);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedTenant && PRESET_ITEMS[selectedTenant]) {
      setLineItems(PRESET_ITEMS[selectedTenant]);
    }
    const t = tenants.find((t) => t.slug === selectedTenant);
    if (t) {
      setCustomerName(t.name);
    }
  }, [selectedTenant, tenants]);

  const total = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const addItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (idx: number) => {
    setLineItems(lineItems.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lineItems];
    if (field === "description") {
      updated[idx] = { ...updated[idx], description: value as string };
    } else {
      updated[idx] = { ...updated[idx], [field]: Number(value) || 0 };
    }
    setLineItems(updated);
  };

  const handleGenerate = async () => {
    if (!selectedTenant || !customerName || lineItems.length === 0) {
      setError("Select a tenant, enter customer name, and add at least one line item");
      return;
    }
    setGenerating(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: selectedTenant,
          customerName,
          customerEmail: customerEmail || undefined,
          lineItems,
          notes: notes || undefined,
          status,
          storeInR2,
        }),
      });

      if (storeInR2) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Generation failed");
        setResult(data);
      } else {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Generation failed");
        }
        // Direct PDF download
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${selectedTenant}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        setResult({ invoiceNumber: "Downloaded" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tenant selector */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Tenant
          </label>
          <select
            value={selectedTenant}
            onChange={(e) => setSelectedTenant(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50"
          >
            <option value="">Select tenant...</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.slug}>
                {t.name} ({t.slug})
              </option>
            ))}
            {/* Fallback if API fails */}
            {tenants.length === 0 && (
              <option value="elite-pro-remodeling">
                Elite Pro Remodeling
              </option>
            )}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Customer Name
          </label>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50"
            placeholder="Elite Pro Remodeling"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Customer Email
          </label>
          <input
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50"
            placeholder="saar@eliteproremodeling.com"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "unpaid" | "paid" | "overdue")}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50"
          >
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Line items */}
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Line Items
        </label>
        <div className="space-y-2">
          {lineItems.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <input
                value={item.description}
                onChange={(e) => updateItem(idx, "description", e.target.value)}
                className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50"
                placeholder="Service description..."
              />
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                className="w-16 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm text-center focus:outline-none focus:border-amber-500/50"
                min={1}
              />
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 text-sm">$</span>
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(idx, "unitPrice", e.target.value)}
                  className="w-28 bg-slate-800/50 border border-slate-700 rounded-lg pl-7 pr-3 py-2 text-white text-sm text-right focus:outline-none focus:border-amber-500/50"
                  min={0}
                  step={0.01}
                />
              </div>
              {lineItems.length > 1 && (
                <button
                  onClick={() => removeItem(idx)}
                  className="text-red-400 hover:text-red-300 p-2 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addItem}
          className="mt-2 text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors"
        >
          + Add line item
        </button>
      </div>

      {/* Total */}
      <div className="flex justify-end">
        <div className="bg-slate-800/80 rounded-xl px-6 py-3 border border-slate-700">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total: </span>
          <span className="text-xl font-black text-amber-400">
            ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm resize-none focus:outline-none focus:border-amber-500/50"
        />
      </div>

      {/* Options */}
      <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          checked={storeInR2}
          onChange={(e) => setStoreInR2(e.target.checked)}
          className="rounded border-slate-600 bg-slate-800"
        />
        Store in R2 (permanent URL)
      </label>

      {/* Generate */}
      <button
        onClick={handleGenerate}
        disabled={generating || !selectedTenant || !customerName}
        className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-30 cursor-pointer hover:brightness-110 active:scale-[0.98]"
        style={{
          background: "linear-gradient(135deg, #c9a96e, #d0b25a, #e8d48b)",
          color: "#1a1a2e",
          boxShadow: "0 0 20px rgba(208,178,90,0.25)",
        }}
      >
        {generating ? "Generating..." : "Generate Invoice PDF"}
      </button>

      {/* Result */}
      {result && (
        <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4">
          <p className="text-emerald-400 font-bold text-sm mb-1">
            Invoice generated: {result.invoiceNumber}
          </p>
          {result.url && (
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 text-sm underline break-all"
            >
              {result.url}
            </a>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400 font-semibold text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
