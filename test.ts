import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { prepare, PreprareOptions } from "./mod.ts";

const { test, runTests } = Deno;
const textDecoder = new TextDecoder();

test(async function testPrepare() {
  const releaseUrl =
    "https://github.com/manyuanrong/deno-plugin-prepare/releases/download/plugin_bins";

  const pluginOptions: PreprareOptions = {
    name: "test_plugin",
    urls: {
      mac: `${releaseUrl}/libtest_plugin.dylib`,
      win: `${releaseUrl}/test_plugin.dll`,
      linux: `${releaseUrl}/libtest_plugin.so`
    }
  };
  const plugin: Deno.Plugin = await prepare(pluginOptions);
  const { testSync } = plugin.ops;

  const response = testSync.dispatch(
    new Uint8Array([116, 101, 115, 116]),
    new Uint8Array([116, 101, 115, 116])
  )!;

  assertEquals(textDecoder.decode(response), "test");
});

runTests();
