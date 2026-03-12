/**
 * Test contract — verifies the signing -> webhook -> notification flow
 * without consuming the real Elite Pro contract.
 *
 * Run: cd apps/worker && npx tsx src/scripts/test-contract-flow.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env"), override: true });

import { sendServiceContract } from "../services/esignatures";

async function main() {
  console.log("Sending TEST contract for webhook flow verification...\n");

  const result = await sendServiceContract({
    clientName: "Test Signer",
    clientCompany: "Flow Verification Test",
    clientEmail: "shai@superseller.agency",
    serviceName: "Test — Webhook Verification",
    scope:
      "This is a test contract to verify the signing → webhook → notification flow.",
    deliverables: [
      "1. Verify signing works",
      "2. Verify webhook fires",
      "3. Verify WhatsApp notification arrives",
    ].join("\n"),
    timeline: "Immediate — test only",
    setupFee: "$0",
    monthlyFee: "$0 (test)",
    paymentTerms: "No payment — this is a test contract",
  });

  console.log("Test contract sent!\n");
  console.log("Contract ID:", result.contractId);
  console.log("Status:", result.status);
  console.log("\nSigners:");
  for (const signer of result.signers) {
    console.log(`  ${signer.name} (${signer.email})`);
    console.log(`  Status: ${signer.status}`);
    if (signer.signUrl) console.log(`  Sign URL: ${signer.signUrl}`);
  }
}

main().catch((err) => {
  console.error("Failed to send test contract:", err.message);
  process.exit(1);
});
