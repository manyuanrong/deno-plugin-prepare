import { assertEquals } from "./test_deps.ts";
import { prepare, PerpareOptions } from "./mod.ts";

const test = Deno.test;
const textDecoder = new TextDecoder();

test({
  name: "prepare",
  async fn(): Promise<void> {
    const releaseUrl =
      "https://github.com/manyuanrong/deno-plugin-prepare/releases/download/plugin_bins";

    const pluginOptions: PerpareOptions = {
      name: "test_plugin",
      printLog: true,
      urls: {
        darwin: `${releaseUrl}/libtest_plugin.dylib`,
        windows: `${releaseUrl}/test_plugin.dll`,
        linux: `${releaseUrl}/libtest_plugin.so`,
      },
    };
    const plugin = await prepare(pluginOptions);
    //@ts-ignore
    const { testSync } = Deno.core.ops();

    //@ts-ignore
    const response = Deno.core.dispatch(
      testSync,
      new Uint8Array([116, 101, 115, 116]),
      new Uint8Array([116, 101, 115, 116]),
    )!;

    assertEquals(textDecoder.decode(response), "test");
  },
});

test({
  name: "prepare local",
  async fn(): Promise<void> {
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
    const plugin = await prepare(pluginOptions);
    //@ts-ignore
    const { testSync } = Deno.core.ops();

    //@ts-ignore
    const response = Deno.core.dispatch(
      testSync,
      new Uint8Array([116, 101, 115, 116]),
      new Uint8Array([116, 101, 115, 116]),
    )!;
    assertEquals(textDecoder.decode(response), "test");
  },
});
