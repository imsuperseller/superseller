#!/usr/bin/env npx tsx
/**
 * Schema Sentinel — Compares Prisma and Drizzle schemas on shared tables.
 * Flags type mismatches, missing fields, and column name drift.
 *
 * Usage:
 *   npx tsx tools/schema-sentinel.ts          # report only
 *   npx tsx tools/schema-sentinel.ts --strict  # exit 1 on any mismatch (CI mode)
 *
 * Shared tables (must stay in sync):
 *   - User / users
 *   - Tenant / tenants
 *   - TenantUser / tenant_users
 *   - Entitlement / entitlements
 *   - UsageEvent / usage_events
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, "..");
const PRISMA_PATH = path.join(REPO_ROOT, "apps/web/superseller-site/prisma/schema.prisma");
const DRIZZLE_PATH = path.join(REPO_ROOT, "apps/worker-packages/db/src/schema.ts");

const strict = process.argv.includes("--strict");

interface FieldDef {
    name: string;
    type: string;
    optional: boolean;
    dbColumn?: string; // from @map or Drizzle column name
}

interface ModelDef {
    name: string;
    fields: FieldDef[];
    dbTable?: string; // from @@map
}

// ── Parse Prisma schema ────────────────────────────────────────────

function parsePrisma(content: string): ModelDef[] {
    const models: ModelDef[] = [];
    const modelRegex = /model\s+(\w+)\s*\{([^}]+)\}/g;
    let match: RegExpExecArray | null;

    while ((match = modelRegex.exec(content)) !== null) {
        const modelName = match[1];
        const body = match[2];
        const fields: FieldDef[] = [];
        let dbTable: string | undefined;

        for (const line of body.split("\n")) {
            const trimmed = line.trim();

            // Check for @@map("table_name")
            const tableMap = trimmed.match(/@@map\("(\w+)"\)/);
            if (tableMap) {
                dbTable = tableMap[1];
                continue;
            }

            // Skip comments, empty lines, directives, relations
            if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("@@") || trimmed.startsWith("///")) continue;

            // Parse field: name Type? @map("col") @db.Xxx
            const fieldMatch = trimmed.match(/^(\w+)\s+([\w\[\]]+)(\?)?/);
            if (!fieldMatch) continue;

            const fieldName = fieldMatch[1];
            let fieldType = fieldMatch[2];
            const optional = !!fieldMatch[3];

            // Skip relation fields (capitalized type with no @db)
            if (fieldType[0] === fieldType[0].toUpperCase() && !trimmed.includes("@db.") && !["String", "Int", "Float", "Boolean", "DateTime", "Json", "BigInt", "Decimal", "Bytes"].includes(fieldType)) {
                continue;
            }

            // Skip array relations
            if (fieldType.endsWith("[]")) continue;

            // Check for @map
            const mapMatch = trimmed.match(/@map\("(\w+)"\)/);
            const dbColumn = mapMatch ? mapMatch[1] : fieldName;

            // Normalize type
            const dbTypeMatch = trimmed.match(/@db\.(\w+)/);
            if (dbTypeMatch) {
                fieldType = `${fieldType}(@db.${dbTypeMatch[1]})`;
            }

            fields.push({ name: fieldName, type: fieldType, optional, dbColumn });
        }

        models.push({ name: modelName, fields, dbTable });
    }

    return models;
}

// ── Parse Drizzle schema ───────────────────────────────────────────

function parseDrizzle(content: string): ModelDef[] {
    const models: ModelDef[] = [];
    // Match: export const tableName = pgTable("db_table", { ... })
    const tableRegex = /export\s+const\s+(\w+)\s*=\s*pgTable\("(\w+)",\s*\{([^}]+)\}/gs;
    let match: RegExpExecArray | null;

    while ((match = tableRegex.exec(content)) !== null) {
        const varName = match[1];
        const dbTable = match[2];
        const body = match[3];
        const fields: FieldDef[] = [];

        for (const line of body.split("\n")) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("/*")) continue;

            // Match: fieldName: type("column_name")
            const fieldMatch = trimmed.match(/^(\w+)\s*:\s*(\w+)\("([^"]+)"/);
            if (!fieldMatch) continue;

            const fieldName = fieldMatch[1];
            const drizzleType = fieldMatch[2]; // uuid, text, timestamp, integer, jsonb, numeric, boolean
            const dbColumn = fieldMatch[3];

            fields.push({ name: fieldName, type: drizzleType, optional: false, dbColumn });
        }

        models.push({ name: varName, fields, dbTable });
    }

    return models;
}

// ── Type compatibility matrix ──────────────────────────────────────

const TYPE_MAP: Record<string, string[]> = {
    // Prisma type -> compatible Drizzle types
    "String": ["text", "varchar"],
    "String(@db.Uuid)": ["uuid", "text"],
    "String(@db.Text)": ["text"],
    "Int": ["integer", "numeric"],
    "Float": ["numeric", "real", "doublePrecision"],
    "Boolean": ["boolean"],
    "DateTime": ["timestamp"],
    "Json": ["jsonb", "json"],
    "BigInt": ["bigint"],
    "Decimal": ["numeric"],
};

function areTypesCompatible(prismaType: string, drizzleType: string): boolean {
    // Strip optional marker
    const cleanPrisma = prismaType.replace("?", "");

    const compatible = TYPE_MAP[cleanPrisma];
    if (compatible && compatible.includes(drizzleType)) return true;

    // Fallback: check base type without @db annotation
    const baseType = cleanPrisma.replace(/\(@db\.\w+\)/, "");
    const baseCompatible = TYPE_MAP[baseType];
    if (baseCompatible && baseCompatible.includes(drizzleType)) return true;

    return false;
}

// ── Shared table mapping ───────────────────────────────────────────

const SHARED_TABLES: Array<{ prismaModel: string; drizzleVar: string; dbTable: string }> = [
    { prismaModel: "User", drizzleVar: "users", dbTable: "users" },
    { prismaModel: "Tenant", drizzleVar: "tenants", dbTable: "tenants" },
    { prismaModel: "TenantUser", drizzleVar: "tenantUsers", dbTable: "tenant_users" },
    { prismaModel: "Entitlement", drizzleVar: "entitlementsTable", dbTable: "entitlements" },
    { prismaModel: "UsageEvent", drizzleVar: "usageEvents", dbTable: "usage_events" },
];

// ── Main ───────────────────────────────────────────────────────────

function main() {
    console.log("Schema Sentinel — Prisma <-> Drizzle Comparison\n");
    console.log("=".repeat(60));

    if (!fs.existsSync(PRISMA_PATH)) {
        console.error(`Prisma schema not found: ${PRISMA_PATH}`);
        process.exit(1);
    }
    if (!fs.existsSync(DRIZZLE_PATH)) {
        console.error(`Drizzle schema not found: ${DRIZZLE_PATH}`);
        process.exit(1);
    }

    const prismaContent = fs.readFileSync(PRISMA_PATH, "utf-8");
    const drizzleContent = fs.readFileSync(DRIZZLE_PATH, "utf-8");

    const prismaModels = parsePrisma(prismaContent);
    const drizzleModels = parseDrizzle(drizzleContent);

    let issues = 0;
    let warnings = 0;

    for (const shared of SHARED_TABLES) {
        const prisma = prismaModels.find((m) => m.name === shared.prismaModel);
        const drizzle = drizzleModels.find((m) => m.name === shared.drizzleVar);

        console.log(`\n--- ${shared.prismaModel} (Prisma) <-> ${shared.drizzleVar} (Drizzle) ---`);

        if (!prisma) {
            console.log(`  ERROR: Prisma model "${shared.prismaModel}" not found`);
            issues++;
            continue;
        }
        if (!drizzle) {
            console.log(`  ERROR: Drizzle table "${shared.drizzleVar}" not found`);
            issues++;
            continue;
        }

        // Build lookup by DB column name
        const prismaByCol = new Map<string, FieldDef>();
        for (const f of prisma.fields) {
            prismaByCol.set(f.dbColumn || f.name, f);
        }

        const drizzleByCol = new Map<string, FieldDef>();
        for (const f of drizzle.fields) {
            drizzleByCol.set(f.dbColumn || f.name, f);
        }

        // Check Drizzle fields exist in Prisma
        for (const [col, df] of drizzleByCol) {
            const pf = prismaByCol.get(col);
            if (!pf) {
                // Try matching by camelCase field name
                const camelCol = col.replace(/_(\w)/g, (_, c) => c.toUpperCase());
                const pfByName = prisma.fields.find((f) => f.name === camelCol || f.name === df.name);
                if (!pfByName) {
                    console.log(`  WARN: Drizzle has column "${col}" but no matching Prisma field`);
                    warnings++;
                    continue;
                }
                // Found by name — check type
                if (!areTypesCompatible(pfByName.type, df.type)) {
                    console.log(`  MISMATCH: "${col}" — Prisma: ${pfByName.type} vs Drizzle: ${df.type}`);
                    issues++;
                } else {
                    console.log(`  OK: "${col}" — types compatible (Prisma: ${pfByName.type}, Drizzle: ${df.type})`);
                }
                continue;
            }

            // Type check
            if (!areTypesCompatible(pf.type, df.type)) {
                console.log(`  MISMATCH: "${col}" — Prisma: ${pf.type} vs Drizzle: ${df.type}`);
                issues++;
            }
        }

        // Check Prisma fields missing in Drizzle (informational)
        const drizzleCols = new Set([...drizzleByCol.keys()]);
        let missingCount = 0;
        for (const [col] of prismaByCol) {
            // Try snake_case conversion
            const snakeCol = col.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
            if (!drizzleCols.has(col) && !drizzleCols.has(snakeCol)) {
                missingCount++;
            }
        }
        if (missingCount > 0) {
            console.log(`  INFO: ${missingCount} Prisma fields not in Drizzle (OK if worker doesn't need them)`);
        }
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log(`\nSummary: ${issues} type mismatches, ${warnings} warnings`);
    console.log(`Shared tables checked: ${SHARED_TABLES.length}`);

    if (issues > 0 && strict) {
        console.log("\n--strict mode: Exiting with code 1 due to mismatches.");
        process.exit(1);
    }

    if (issues === 0) {
        console.log("\nAll shared table types are compatible.");
    }
}

main();
