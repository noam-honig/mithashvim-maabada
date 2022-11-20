import { Entity, Field, Fields, IdEntity, remult, Remult, SqlDatabase } from "remult";
import { PostgresSchemaBuilder } from "remult/postgres";
import { recordChanges } from "../app/change-log/change-log";
import { Computer } from "../app/computers/computer";

@Entity(undefined!, {
  dbName: "versionInfo"
})
export class VersionInfo extends IdEntity {
  @Fields.number()
  version: number = 0;
}

export async function versionUpdate() {
  let version = async (ver: number, what: () => Promise<void>) => {
    let v = await remult.repo(VersionInfo).findFirst();
    if (!v) {
      v = remult.repo(VersionInfo).create();
      v.version = 0;
    }
    if (v.version <= ver - 1) {
      await what();
      v.version = ver;
      await v.save();
    }
  };

  await version(1, async () => {
    for await (const c of await remult.repo(Computer).query()) {
      await recordChanges(c, {
        forceDate: c.createDate,
        forceNew: true
      })
    }
  });

}