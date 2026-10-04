import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";

/**
 * Ensures that the parent directory of a file exists.
 */
export async function ensureDir(filePathOrDir: string, isFile = true): Promise<void> {
  const dir = isFile ? path.dirname(filePathOrDir) : filePathOrDir;
  await fs.mkdir(dir, { recursive: true });
}

export function ensureDirSync(filePathOrDir: string, isFile = true): void {
  const dir = isFile ? path.dirname(filePathOrDir) : filePathOrDir;
  fsSync.mkdirSync(dir, { recursive: true });
}

/**
 * Reads and parses a JSON file asynchronously. Returns null if file does not exist or fails parsing.
 */
export async function readJson<T = unknown>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Reads and parses a JSON file synchronously. Returns null if file does not exist.
 */
export function readJsonSync<T = unknown>(filePath: string): T | null {
  try {
    if (!fsSync.existsSync(filePath)) return null;
    const raw = fsSync.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Writes data to a JSON file asynchronously, creating any needed parent directories.
 */
export async function writeJson<T = unknown>(filePath: string, data: T, pretty = true): Promise<void> {
  await ensureDir(filePath, true);
  const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  await fs.writeFile(filePath, content, "utf-8");
}

/**
 * Writes data to a JSON file synchronously, creating any needed parent directories.
 */
export function writeJsonSync<T = unknown>(filePath: string, data: T, pretty = true): void {
  ensureDirSync(filePath, true);
  const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  fsSync.writeFileSync(filePath, content, "utf-8");
}