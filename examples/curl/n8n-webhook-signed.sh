#!/usr/bin/env bash
set -euo pipefail

TENANT_ID="${TENANT_ID:-default}"
SECRET="${SECRET:-CHANGEME_DEFAULT_SECRET}"
RUN_ID="${RUN_ID:-$(uuidgen)}"
TS="$(date +%s)"

BODY='{"sku":"leads_csv","plan":"metered","payload":{"source":"demo"}}'

sig=$(printf "%s.%s.%s" "$TS" "$RUN_ID" "$BODY" | \
  openssl dgst -sha256 -hmac "$SECRET" -binary | \
  xxd -p -c 256)

curl -sS -X POST "http://127.0.0.1:8787/api/execute" \
  -H "content-type: application/json" \
  -H "x-rensto-run-id: $RUN_ID" \
  -H "x-rensto-ts: $TS" \
  -H "x-rensto-tenant: $TENANT_ID" \
  -H "x-rensto-sig: $sig" \
  --data "$BODY" | jq .