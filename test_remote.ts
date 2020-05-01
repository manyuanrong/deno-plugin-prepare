import { assertEquals } from "./test_deps.ts";
import { prepare, PerpareOptions } from "./mod.ts";

const textDecoder = new TextDecoder();

async function testPrepareFromLocal() {
  const releaseUrl = "file://./test_bins";

  const pluginOptions: PerpareOptions = {
    name: "test_plugin",
    printLog: true,
    checkCache: false,
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
}

await testPrepareFromLocal();
