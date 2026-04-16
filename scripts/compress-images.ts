import sharp from "sharp";
import fs from "fs";
import path from "path";

async function main() {
  const PETS_DIR = path.join(process.cwd(), "public", "pets");
  const BACKUP_DIR = path.join(process.cwd(), "public", "pets_original");

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const files = fs.readdirSync(PETS_DIR).filter((file) => 
    file.endsWith(".png") || file.endsWith(".jpg") || file.endsWith(".jpeg")
  );

  console.log(`Found ${files.length} images to compress...\n`);

  let totalOriginalSize = 0;
  let totalCompressedSize = 0;

  for (const file of files) {
    const originalPath = path.join(PETS_DIR, file);
    const backupPath = path.join(BACKUP_DIR, file);

    const stat = fs.statSync(originalPath);
    totalOriginalSize += stat.size;

    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(originalPath, backupPath);
    }

    const tempPath = path.join(PETS_DIR, `temp_${file}`);

    try {
      await sharp(originalPath)
        .resize(512, 512, { fit: "inside", withoutEnlargement: true })
        .png({ quality: 80, compressionLevel: 9 })
        .toFile(tempPath);

      const newStat = fs.statSync(tempPath);
      totalCompressedSize += newStat.size;

      fs.unlinkSync(originalPath);
      fs.renameSync(tempPath, originalPath);

      const reduction = ((1 - newStat.size / stat.size) * 100).toFixed(1);
      console.log(
        `✓ ${file.padEnd(30)} ${(stat.size / 1024).toFixed(1).padStart(6)} KB → ${(newStat.size / 1024).toFixed(1).padStart(6)} KB (-${reduction}%)`
      );
    } catch (error) {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      console.log(`✗ ${file} - ${(error as Error).message}`);
    }
  }

  const originalMB = totalOriginalSize / (1024 * 1024);
  const compressedMB = totalCompressedSize / (1024 * 1024);
  const totalReduction = ((1 - totalCompressedSize / totalOriginalSize) * 100).toFixed(1);

  console.log(`\nSummary:`);
  console.log(`  Original: ${originalMB.toFixed(2)} MB`);
  console.log(`  Compressed: ${compressedMB.toFixed(2)} MB`);
  console.log(`  Saved: ${(originalMB - compressedMB).toFixed(2)} MB (-${totalReduction}%)`);
  console.log(`\nBackups saved to: ${BACKUP_DIR}`);
}

main().catch(console.error);
