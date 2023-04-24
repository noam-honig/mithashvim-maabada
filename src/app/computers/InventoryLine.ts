import {
  Entity, Fields,
  IdEntity,
  remult
} from 'remult';
import { gql, MondayItem, update } from '../driver-sign/getGraphQL';


@Entity("inventoryLine")
export class InventoryLine extends IdEntity {
  @Fields.string()
  computerId = '';
  @Fields.string()
  stockItem = '';
  @Fields.string()
  stockItemId = '';
  @Fields.createdAt()
  createdAt = new Date();
  @Fields.object()
  mondayResult: any;
}

const kamutAtMeshaken = "dup__of_______________";
const mlaiBoard = 2673879135;
export async function updateInventory(computerId: string, stockItems: string[]) {
  return;
//   const inventory: MondayItem[] = (await gql({}, `#graphql
// {
//   boards(ids: [${mlaiBoard}]) {
//     id
//     name
//     items(limit: 10000) {
//       id
//       name
//       column_values(ids: ["${kamutAtMeshaken}"]) {
//         id
//         title
//         value
//       }
//     }
//   }
// }

//  `)).boards[0].items

//   for (const stockItem of stockItems) {
//     const item = inventory.find(y => y.name === stockItem);
//     let i = remult.repo(InventoryLine).create({
//       computerId,
//       stockItem
//     })
//     if (item) {
//       i.stockItemId = item.id;
//       let q = +JSON.parse(item!.column_values[0].value);
//       i.mondayResult = await update(mlaiBoard, +item.id, kamutAtMeshaken, (q - 1).toString());
//       await i.save();
//     }
//   }
}