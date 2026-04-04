import "dotenv/config";

import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";

import {
  TinaNodeBackend,
  LocalBackendAuthProvider,
  createDatabase,
  createLocalDatabase,
} from "@tinacms/datalayer";
import { GitHubProvider } from "tinacms-gitprovider-github";
import { Redis } from "@upstash/redis";
import { RedisLevel } from "upstash-redis-level";
import { TinaAuthJSOptions, AuthJsBackendAuthProvider } from "tinacms-authjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = normalize(join(__dirname, ".."));
const publicRoot = join(repoRoot, "public");
const adminRoot = join(publicRoot, "admin");

const host = process.env.TINA_HOST || "127.0.0.1";
const port = Number(process.env.TINA_PORT || 4001);
const isLocal =
  process.env.TINA_PUBLIC_IS_LOCAL === "true" ||
  !process.env.KV_REST_API_URL ||
  !process.env.KV_REST_API_TOKEN;

const databaseClient = isLocal
  ? createLocalDatabase()
  : createDatabase({
      gitProvider: new GitHubProvider({
        branch: process.env.GITHUB_BRANCH || "main",
        owner: process.env.GITHUB_OWNER || "",
        repo: process.env.GITHUB_REPO || "",
        token: process.env.GITHUB_PERSONAL_ACCESS_TOKEN || "",
      }),
      databaseAdapter: new RedisLevel({
        redis: new Redis({
          url: process.env.KV_REST_API_URL || "",
          token: process.env.KV_REST_API_TOKEN || "",
        }),
        debug: process.env.DEBUG === "true",
      }),
    });

const handler = TinaNodeBackend({
  authProvider: isLocal
    ? LocalBackendAuthProvider()
    : AuthJsBackendAuthProvider({
        authOptions: TinaAuthJSOptions({
          databaseClient,
          secret: process.env.NEXTAUTH_SECRET || "",
        }),
      }),
  databaseClient,
});

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "application/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".avif", "image/avif"],
  [".ico", "image/x-icon"],
  [".map", "application/json; charset=utf-8"],
]);

function sendFile(res, filePath) {
  const type = mimeTypes.get(extname(filePath)) || "application/octet-stream";
  const stream = createReadStream(filePath);

  res.writeHead(200, { "content-type": type });
  stream.pipe(res);
}

function safeResolve(basePath, pathname) {
  const cleanPath = normalize(join(basePath, pathname));
  return cleanPath.startsWith(basePath) ? cleanPath : null;
}

function tryStatic(res, pathname) {
  const targetPath =
    pathname === "/" || pathname === "/admin"
      ? join(adminRoot, "index.html")
      : pathname.startsWith("/admin/")
        ? safeResolve(adminRoot, pathname.slice("/admin/".length))
        : safeResolve(publicRoot, pathname.slice(1));

  if (!targetPath || !existsSync(targetPath)) {
    return false;
  }

  const stats = statSync(targetPath);

  if (stats.isDirectory()) {
    const indexPath = join(targetPath, "index.html");
    if (!existsSync(indexPath)) {
      return false;
    }
    sendFile(res, indexPath);
    return true;
  }

  sendFile(res, targetPath);
  return true;
}

const server = createServer((req, res) => {
  const pathname = new URL(req.url || "/", `http://${req.headers.host || host}`).pathname;

  if (pathname.startsWith("/api/tina/")) {
    handler(req, res);
    return;
  }

  if (tryStatic(res, pathname)) {
    return;
  }

  res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
  res.end("Not Found");
});

server.listen(port, host, () => {
  console.log(`Tina production server listening on http://${host}:${port}`);
});
