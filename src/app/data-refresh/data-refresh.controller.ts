import { Allow, BackendMethod } from "remult";

let lastUpdate = new Date();

export class DataRefreshController {
  @BackendMethod({ allowed: Allow.authenticated })
  static async lastUpdate() {
    return lastUpdate.toISOString();
  }

}
export function dataWasChanged() {
  lastUpdate = new Date();
}