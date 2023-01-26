import { api } from "./api";
import { versionUpdate } from "./version";


api.withRemult(undefined!, undefined!, async () => {
  await versionUpdate();
  console.log("version update OK!");
})