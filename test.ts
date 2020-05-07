import { assertEquals } from "./test_deps.ts";
import { prepare, PerpareOptions } from "./mod.ts";

const textDecoder = new TextDecoder();

async function testPrepare(releaseUrl: string) {
  const pluginOptions: PerpareOptions = {
    name: "test_plugin",
    printLog: true,
    urls: {
      darwin: `${releaseUrl}/libtest_plugin.dylib`,
      windows: `${releaseUrl}/test_plugin.dll`,
      linux: `${releaseUrl}/libtest_plugin.so`,
    },
  };
  const pluginId = await prepare(pluginOptions);
  //@ts-ignore
  const { testSync } = Deno.core.ops();

  //@ts-ignore
  const response = Deno.core.dispatch(
    testSync,
    new Uint8Array([116, 101, 115, 116]),
    new Uint8Array([116, 101, 115, 116]),
  )!;

  assertEquals(textDecoder.decode(response), "test");

  Deno.close(pluginId);
}

Deno.test("testPrepareLocal", async () => {
  return testPrepare(
    "file://./test_plugin/target/debug",
  );
});

// Deno.test("testPrepareRemote", async () => {
//   return testPrepare(
//     "https://github.com/manyuanrong/deno-plugin-prepare/releases/download/plugin_bins",
//   );
// });
