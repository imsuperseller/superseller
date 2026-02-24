'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProduct() {
  const router = useRouter();
  const [productType, setProductType] = useState('DOORS');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Build config based on product type
      const config = productType === 'DOORS'
        ? {
            collections: ["Classic™ Steel", "Bridgeport™ Steel", "Coachman®", "Modern Steel™", "Canyon Ridge® Collection"],
            sizes: ["8x7", "9x7", "10x7", "16x7", "16x8", "18x7", "18x8"],
            designs: ["Short Panel", "Long Panel"],
            colors: ["White", "Almond", "Desert Tan", "Sandtone", "Bronze", "Chocolate", "Charcoal", "Gray", "Black"],
            constructions: [
              "2\" Intellicore® Insulated R-18",
              "1 3/8\" Intellicore R-12",
              "2\" Polystyrene R-9",
              "1 3/8\" Polystyrene R-6"
            ],
            pricing: {
              "8x7": 1800,
              "9x7": 2000,
              "10x7": 2200,
              "16x7": 3400,
              "16x8": 3800,
              "18x7": 4200,
              "18x8": 4600
            }
          }
        : {
            scenarios: [
              { setting: "indoors", kids: "few", balls: true, desc: "Toddlers playing with colorful balls inside white bounce house in living room" },
              { setting: "indoors", kids: "many", balls: true, desc: "Birthday party with kids jumping in white bouncy castle, colorful balls flying" },
              { setting: "outdoors", kids: "few", balls: false, desc: "Two kids jumping in white bounce house in sunny backyard" },
              { setting: "outdoors", kids: "many", balls: true, desc: "Backyard birthday party, white inflatable bouncer full of happy kids and balls" },
              { setting: "indoors", kids: "few", balls: false, desc: "Kids jumping in white bounce house in garage, joyful moment" },
              { setting: "outdoors", kids: "many", balls: false, desc: "Group of children bouncing in white inflatable castle at outdoor party" }
            ]
          };

      const pricing = productType === 'DOORS'
        ? { basePrice: 2500, variationPercent: 5, markup: 1.1 }
        : { basePrice: 75, variationPercent: 0 };

      const schedule = {
        operatingHours: {
          start: "6am",
          end: "10pm",
          timezone: "America/Chicago"
        },
        postLimit: productType === 'DOORS' ? 5 : 3,
        cooldownMinutes: productType === 'DOORS' ? 15 : 30
      };

      const res = await fetch('/api/marketplace/customer/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType,
          name,
          config,
          pricing,
          schedule,
          locations: productType === 'DOORS'
            ? ["Dallas, TX", "Fort Worth, TX", "Arlington, TX", "Plano, TX"]
            : ["Dallas, TX", "Richardson, TX", "Garland, TX"],
          phoneNumbers: productType === 'DOORS'
            ? ["+1-972-954-2407", "+1-214-256-3408", "+1-469-814-6509", "+1-972-646-6110"]
            : ["+1-469-283-9855"]
        }),
      });

      const data = await res.json();

      if (data.success) {
        router.push(`/dashboard/marketplace/products/${data.product.id}`);
      } else {
        alert('Failed to create product: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to create product:', error);
      alert('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Add New Product</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Type
          </label>
          <select
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="DOORS">Garage Doors (UAD)</option>
            <option value="BOUNCE_HOUSES">Bounce Houses</option>
            <option value="FURNITURE">Furniture</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., UAD Garage Doors - DFW"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Default Configuration</h3>
          <p className="text-sm text-blue-700">
            {productType === 'DOORS' && "5 collections × 7 sizes × 2 designs × 9 colors × 4 constructions = 2,520 unique configs"}
            {productType === 'BOUNCE_HOUSES' && "6 scenarios (indoor/outdoor, few/many kids, with/without balls)"}
            {productType === 'FURNITURE' && "Custom furniture configurations"}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !name}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
