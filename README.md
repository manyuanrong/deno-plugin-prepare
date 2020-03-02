# deno-plugin-prepare

A library for managing deno native plugin dependencies

[![tag](https://img.shields.io/github/tag/manyuanrong/deno-plugin-prepare.svg)](https://github.com/manyuanrong/deno-plugin-prepare)
[![Build Status](https://github.com/manyuanrong/deno-plugin-prepare/workflows/ci/badge.svg?branch=master)](https://github.com/manyuanrong/deno-plugin-prepare/actions)
[![license](https://img.shields.io/github/license/manyuanrong/deno-plugin-prepare.svg)](https://github.com/manyuanrong/deno-plugin-prepare)
[![tag](https://img.shields.io/badge/deno-v0.35.0-green.svg)](https://github.com/denoland/deno)

### Useage

```ts
import {
  prepare,
  PreprareOptions
} from "https://raw.githubusercontent.com/manyuanrong/deno-plugin-prepare/master/mod.ts";

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

const response = testSync.dispatch(new Uint8Array([116, 101, 115, 116]))!;

console.log(response);
```
