# deno-plugin-prepare

A library for managing deno native plugin dependencies

[![tag](https://img.shields.io/github/tag/manyuanrong/deno-plugin-prepare.svg)](https://github.com/manyuanrong/deno-plugin-prepare)
[![Build Status](https://github.com/manyuanrong/deno-plugin-prepare/workflows/ci/badge.svg?branch=master)](https://github.com/manyuanrong/deno-plugin-prepare/actions)
[![license](https://img.shields.io/github/license/manyuanrong/deno-plugin-prepare.svg)](https://github.com/manyuanrong/deno-plugin-prepare)
[![tag](https://img.shields.io/badge/deno-v1.0.0-green.svg)](https://github.com/denoland/deno)

### Why do you need this module?

Because Deno's plugin is not a first-class citizen, it cannot be loaded directly using `import` like `js`, `ts`, and `json`.

Deno's plugin is compiled with other system-level languages, and cannot be compiled into one target result across multiple platforms, usually compiled into multiple platform target binaries. These binary files are usually much larger than scripts such as `js/ts`, so they should not be downloaded all, need to be dynamically loaded according to the platform.

### API

#### prepare

The API needs to provide some plug-in information, including the name of the plugin, and the remote url of the binary file for different platforms. It is similar to an asynchronous version of `Deno.openPlugin`, which will automatically download the corresponding binary file according to the platform and cache it in the `.deno_plugins` directory of the current working directory.

### Useage

```ts
import {
  prepare,
  PerpareOptions,
} from "https://deno.land/x/plugin_prepare@v0.6.0/mod.ts";

const releaseUrl =
  "https://github.com/manyuanrong/deno-plugin-prepare/releases/download/plugin_bins";

const pluginOptions: PerpareOptions = {
  name: "test_plugin",

  // Whether to output log. Optional, default is true
  // printLog: true,

  // Whether to use locally cached files. Optional, default is true
  // checkCache: true,

  // Support "http://", "https://", "file://"
  urls: {
    darwin: `${releaseUrl}/libtest_plugin.dylib`,
    windows: `${releaseUrl}/test_plugin.dll`,
    linux: `${releaseUrl}/libtest_plugin.so`,
  },
};
const rid = await prepare(pluginOptions);
//@ts-ignore
const { testSync } = Deno.core.ops();
//@ts-ignore
const response = Deno.core.dispatch(
  testSync,
  new Uint8Array([116, 101, 115, 116])
)!;

console.log(response);
Deno.close(rid);
```

### TODOs

- [x] Caching binary files with URL hash (multi-version coexistence)
- [ ] Supports downloading and decompressing .GZ files
