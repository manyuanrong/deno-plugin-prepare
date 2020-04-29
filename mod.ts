import { existsSync } from "https://deno.land/std/fs/exists.ts";
import * as log from "https://deno.land/std/log/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import { encode, Hash } from "https://deno.land/x/checksum@1.2.0/mod.ts";

const os = Deno.build.os;
const md5 = new Hash("md5");

const PLUGIN_SUFFIX_MAP: { [os in Deno.OperatingSystem]: string } = {
  mac: ".dylib",
  win: ".dll",
  linux: ".so",
};

const pluginSuffix = PLUGIN_SUFFIX_MAP[os];

export interface PreprareOptions {
  name: string;
  printLog?: boolean;
  checkCache?: boolean;
  urls: {
    mac?: string;
    linux?: string;
    win?: string;
  };
}

export async function download(options: PreprareOptions) {
  const { name, urls, checkCache = true } = options;

  const remoteUrl = urls[os];
  const remoteHash = md5.digest(encode(remoteUrl + pluginSuffix)).hex();
  const cacheFileName = `${name}_${remoteHash}${pluginSuffix}`;
  const localPath = path.resolve(".deno_plugins", cacheFileName);

  Deno.mkdirSync(".deno_plugins", { recursive: true });

  if (!existsSync(localPath) || !checkCache) {
    if (!remoteUrl) {
      throw Error(
        `"${name}" plugin does not provide binaries suitable for the current system`,
      );
    }

    if (remoteUrl.startsWith("file://")) {
      const fromPath = path.resolve(remoteUrl.slice(7));
      await copyFromLocal(name, fromPath, localPath);
    } else {
      await downloadFromRemote(name, remoteUrl, localPath);
    }
  }

  return localPath;
}

export async function prepare(options: PreprareOptions) {
  const { name, printLog = true } = options;

  if (printLog) {
    await log.setup({});
  }

  const localPath = await download(options);

  log.info(`load deno plugin "${name}" from local "${localPath}"`);
  return Deno.openPlugin(localPath);
}

async function downloadFromRemote(
  name: string,
  remoteUrl: string,
  savePath: string,
) {
  log.info(`downloading deno plugin "${name}" from "${remoteUrl}"`);
  const download = await fetch(remoteUrl);

  if (download.status !== 200) {
    throw Error(`downloading plugin "${name}" from "${remoteUrl}" failed.`);
  }

  const pluginFileData = await download.arrayBuffer();
  await Deno.writeFile(savePath, new Uint8Array(pluginFileData));
}

async function copyFromLocal(name: string, from: string, to: string) {
  log.info(`copy deno plugin "${name}" from "${from}"`);

  if (!existsSync(from)) {
    throw Error(
      `copy plugin "${name}" from "${from}" failed, ${from} does not exist.`,
    );
  }

  await Deno.copyFile(from, to);
}
