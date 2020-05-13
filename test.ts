import { exists } from "./deps.ts";
import { assert, serve, serveFile, resolve } from "./test_deps.ts";

const pluginDir = ".deno_plugins";

async function cleanCache() {
  if (await exists(pluginDir)) {
    return Deno.remove(pluginDir, { recursive: true });
  }
}

async function pluginIsCached(): Promise<boolean> {
  if (!await exists(pluginDir)) {
    return false;
  }
  for (const _ of Deno.readDirSync(pluginDir)) {
    return true;
  }
  return false;
}

Deno.test("testPrepareLocal", async () => {
  await cleanCache();

  let p = Deno.run({
    cmd: [
      "deno",
      "run",
      "--allow-read",
      "--allow-write",
      "--allow-plugin",
      "--unstable",
      "./tests/local.ts",
    ],
  });

  let status = await p.status();
  assert(status.success);
  assert(await pluginIsCached());
  p.close();

  p = Deno.run({
    cmd: [
      "deno",
      "run",
      "--allow-read",
      "--allow-write",
      "--allow-plugin",
      "--unstable",
      "./tests/local.ts",
    ],
  });

  status = await p.status();
  assert(status.success);

  p.close();
});

function startServer(addr: string) {
  const server = serve("127.0.0.1:4500");

  (async () => {
    for await (const request of server) {
      const response = await serveFile(
        request,
        resolve(`.${request.url}`),
      );
      const file = response.body as Deno.File;
      await request.respond(response);
      file.close();
    }
  })();

  return server;
}

Deno.test("testPrepareRemote", async () => {
  await cleanCache();

  const address = "localhost:4500";
  const server = startServer(address);

  let p = Deno.run({
    cmd: [
      "deno",
      "run",
      "--allow-read",
      "--allow-write",
      "--allow-plugin",
      "--allow-net",
      "--unstable",
      "./tests/remote.ts",
      address,
    ],
  });

  let status = await p.status();
  assert(status.success);
  assert(await pluginIsCached());
  p.close();

  p = Deno.run({
    cmd: [
      "deno",
      "run",
      "--allow-read",
      "--allow-write",
      "--allow-plugin",
      "--allow-net",
      "--unstable",
      "./tests/remote.ts",
      address,
    ],
  });

  status = await p.status();
  assert(status.success);

  p.close();
  server.close();
});
