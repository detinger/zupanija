import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  BUDGET_METRICS, budgetFunctions, functionChildren, metricValue, ratioPercent,
  readBudgetMetric, sumMetric,
} from "../src/lib/budgetExplorer.ts";
import type { FlatRow, SazetakRow } from "../src/lib/types.ts";

const rows: FlatRow[] = JSON.parse(readFileSync(new URL("../public/data/funkcijska.json", import.meta.url), "utf8"));
const summary: SazetakRow[] = JSON.parse(readFileSync(new URL("../public/data/sazetak.json", import.meta.url), "utf8"));
const functions = budgetFunctions(rows);
const sourceTotal = rows.find((row) => row.razina === 0)!;
const summaryTotal = summary.find((row) => row.opis === "Ukupni rashodi")!;
const close = (actual: number, expected: number, context: string) =>
  assert.ok(Math.abs(actual - expected) < .011, `${context}: ${actual} != ${expected}`);

assert.equal(functions.length, 10);
assert.equal(new Set(functions.map((row) => row.kod)).size, functions.length);
for (const { key } of BUDGET_METRICS) {
  for (const row of rows) assert.equal(typeof row[key], "number", `Missing amount: ${row.kod}, ${key}`);
  const total = sumMetric(functions, key);
  close(total, metricValue(sourceTotal, key), `Functions reconcile with functional total (${key})`);
  close(total, summaryTotal[key]!, `Functions reconcile with summary (${key})`);
  close(functions.reduce((sum, row) => sum + ratioPercent(metricValue(row, key), total)!, 0), 100, `Shares sum to 100 (${key})`);

  for (const parent of functions) {
    const children = functionChildren(rows, parent.kod!);
    assert.ok(children.length > 0, `Children exist for ${parent.kod}`);
    close(sumMetric(children, key), metricValue(parent, key), `Children reconcile with ${parent.kod} (${key})`);
  }
}

// Zero baselines must never produce Infinity, NaN or a fabricated growth percentage.
assert.equal(ratioPercent(10, 0), null);
assert.equal(ratioPercent(0, 100), 0);
assert.equal(ratioPercent(125, 100), 125);
assert.equal(readBudgetMetric("not-a-metric"), "izvrsenje2025");
assert.equal(readBudgetMetric("tekuciPlan2025"), "tekuciPlan2025");
assert.equal(functionChildren(rows, "99").length, 0);
assert.equal(sumMetric([], "izvrsenje2025"), 0);

console.log(`Verified ${functions.length} functions, 3 measures, all child totals, summary reconciliation and zero baselines.`);
console.log(`Executed expenditure: ${sumMetric(functions, "izvrsenje2025").toFixed(2)} EUR.`);
