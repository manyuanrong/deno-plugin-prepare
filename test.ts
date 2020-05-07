import { delay } from "./test_deps.ts";

const fileServer = Deno.run({
  cmd: [
    Deno.execPath(),
    "run",
    "--allow-read",
    "--allow-net",
    "https://deno.land/std@v1.0.0-rc1/http/file_server.ts",
  ],
});

Deno.test("testPrepareLocal", async () => {
  const p = Deno.run({
    cmd: [
      "deno",
      "test",
      "--allow-read",
      "--allow-write",
      "--allow-plugin",
      "--unstable",
      "./tests/local.ts",
    ],
  });
  await p.status();
  p.close();
});

Deno.test("testPrepareRemote", async () => {
  await delay(1000);
  const p = Deno.run({
    cmd: [
      "deno",
      "test",
      "--allow-read",
      "--allow-write",
      "--allow-plugin",
      "--unstable",
      "./tests/local.ts",
    ],
  });
  await p.status();
  p.close();
});

fileServer.close();
