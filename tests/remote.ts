import { testPrepare } from "./util.ts";
import { assert } from "../test_deps.ts";

const address = Deno.args[0];
assert(address && address.length > 0, "no address");

await testPrepare(`http://${address}/test_plugin/target/debug`);
