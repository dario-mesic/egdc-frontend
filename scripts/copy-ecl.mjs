import { cp, mkdir } from "node:fs/promises";
import path from "node:path";

async function copyDir(src, dest) {
  await mkdir(dest, { recursive: true });
  await cp(src, dest, { recursive: true });
}

await copyDir(
  path.resolve("node_modules/@ecl/preset-ec/dist"),
  path.resolve("public/ecl")
);

console.log("Copied ECL preset to /public");
