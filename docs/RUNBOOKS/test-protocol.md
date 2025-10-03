# Test Protocol
- [ ] HMAC failure → 401
- [ ] Expired ts → 401
- [ ] Duplicate run_id → 409
- [ ] Throttle exceeded → 429 (currently throws; translate in handler if desired)
- [ ] `sub` w/o active subscription → 402
- [ ] Airtable row created