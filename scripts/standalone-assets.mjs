import fs from "fs-extra";
import path from "path";

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");
const srcPublic = path.join(root, "public");
const dstPublic = path.join(standaloneDir, "public");

const srcStatic = path.join(root, ".next", "static");
const dstStatic = path.join(standaloneDir, ".next", "static");

async function main() {
  if (!(await fs.pathExists(standaloneDir))) {
    throw new Error(
      `Missing ${standaloneDir}. Did you run "next build" with output:"standalone"?`,
    );
  }

  if (await fs.pathExists(srcPublic)) {
    await fs.copy(srcPublic, dstPublic, { overwrite: true });
    console.log(`✓ Copied public -> ${path.relative(root, dstPublic)}`);
  } else {
    console.warn("⚠ No public/ folder found to copy");
  }

  if (await fs.pathExists(srcStatic)) {
    await fs.ensureDir(path.join(standaloneDir, ".next"));
    await fs.copy(srcStatic, dstStatic, { overwrite: true });
    console.log(`✓ Copied .next/static -> ${path.relative(root, dstStatic)}`);
  } else {
    console.warn("⚠ No .next/static folder found to copy");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
