import { existsSync } from "https://deno.land/std/fs/exists.ts";
import * as log from "https://deno.land/std/log/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import { encode, Hash } from "https://deno.land/x/checksum@1.1.0/mod.ts";

const os = Deno.build.os;
const md5 = new Hash("md5");

await log.setup({});

const PLUGIN_SUFFIX_MAP: { [os in Deno.OperatingSystem]: string } = {
  mac: ".dylib",
  win: ".dll",
  linux: ".so"
};

const pluginSuffix = PLUGIN_SUFFIX_MAP[os];

export interface PreprareOptions {
  name: string;
  urls: {
    mac?: string;
    linux?: string;
    win?: string;
  };
}

export async function prepare(options: PreprareOptions) {
  const { name, urls } = options;

  const remoteUrl = urls[os];
  const remoteHash = md5.digest(encode(remoteUrl + pluginSuffix)).hex();
  const cacheFileName = `${name}_${remoteHash}${pluginSuffix}`;
  const localPath = path.resolve(".deno_plugins", cacheFileName);

  Deno.mkdirSync(".deno_plugins", { recursive: true });

  if (!existsSync(localPath)) {
    if (!remoteUrl) {
      throw Error(
        `"${name}" plugin does not provide binaries suitable for the current system`
      );
    }
    log.info(`prepare deno plugin "${name}" from "${remoteUrl}"`);
    const download = await fetch(remoteUrl);

    if (download.status !== 200) {
      throw Error(`downloading plugin "${name}" from "${remoteUrl}" failed.`);
    }

    const pluginFileData = await download.arrayBuffer();
    await Deno.writeFile(localPath, new Uint8Array(pluginFileData));
  }

  log.info(`load deno plugin "${name}" from local "${localPath}"`);
  return Deno.openPlugin(localPath);
}
