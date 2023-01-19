import { FieldType, Field, BackendMethod, Controller, ControllerBase, Fields } from "remult";
import { gql } from "./getGraphQL";
import { sendSms } from "./send-sms";

export const desktop = "מחשב נייח"
export const laptop = "מחשב נייד"

export type Item = {
    id: number;
    name: string;
    quantity: number;
    actualQuantity: string;
    countQuantity: number;
    notes: string;
};

@FieldType<MondayDate>({
    valueConverter: {
        fromDb: x => {
            if (x?.date) return x;
            return null;
        },
        toDb: x => x
    },
    displayValue: (_, d) => {
        if (!d)
            return '';
        return new Date(d.date + "T" + d.time + "Z").toLocaleString()
    }

})
export class MondayDate {
    date = '';
    time = '';
    static now(): MondayDate {
        let d = new Date().toISOString();
        return {
            date: d.substring(0, 10),
            time: d.substring(11, 19)
        }
    }

};

@Controller("deliveryForm")
export class DeliveryFormController extends ControllerBase {
    @Fields.integer()
    id = 0;
    @Fields.string({ caption: 'שם הגוף' })
    name = '';
    @Fields.string({ caption: "שם בית חולים/מחוז", monday: 'text7' })
    hospitalName = '';
    @Fields.string({ monday: 'dup__of_____' })
    city = '';
    @Fields.string({ monday: 'text' })
    street = '';
    @Fields.string({
        monday: 'long_text',
        valueConverter: {
            fromDb: x => x?.text
        }
    })
    notes = '';
    @Fields.string({ monday: 'text3' })
    contact = '';
    @Fields.string({
        monday: 'phone', valueConverter: {
            fromDb: x => x ? x.phone : ''
        }
    })
    contactPhone = '';
    @Fields.string({ monday: 'text8' })
    driverName = '';
    @Field(() => MondayDate, {
        monday: 'date3'
    })
    driverSign: MondayDate | null = null;
    @Field(() => MondayDate, {
        monday: 'date7'
    })
    contactSign: MondayDate | null = null;
    @Fields.object()
    items: Item[] = [];

    @Fields.integer({ monday: 'numbers8' })
    signatureCounter = 0;
    @Fields.string()
    tempSmsResult = '';

    @Fields.integer({ monday: 'numeric', caption: "מחשב נייח", itemNames: ["מחשב", "נייחים", "מחשב AOI", "שרת"] })
    desktops = 0;
    @Fields.integer({ monday: 'numeric4', caption: "מחשב נייד", itemNames: ["לפטופ", "ניידים"] })
    laptops = 0;
    @Fields.integer({ monday: 'numeric3', caption: "מסך", itemNames: ["מסך VGA", "מסכים"] })
    screens = 0;

    @BackendMethod({ allowed: true })
    async load(deliveryId: number) {
        const data = await gql({ id: deliveryId }, `#graphql
query ($id: Int!) {
  boards(ids: [2673923561]) {
    id
    name
    board_folder_id
    board_kind
    items(ids: [$id]) {
      id
      name
      column_values{
        id
        title
        value
      }
      subitems {
        name
        id
        column_values {
          id
          title
          value
        }
      }
    }
  }
}
`);
        const item: {
            id: number,
            name: string,
            column_values: any[],
            subitems: any[]
        } = data.boards[0].items[0];
        this.id = deliveryId;
        this.name = item.name;
        //console.table(item.column_values);
        for (const f of this.$.toArray()) {
            if (f.metadata.options.monday) {
                try {
                    let c: any = item.column_values.find((x: any) => x.id == f.metadata.options.monday);
                    if (c) {
                        f.value = JSON.parse(c.value);
                        if (f.metadata.options.valueConverter?.fromDb)
                            f.value = f.metadata.options.valueConverter?.fromDb(f.value);
                    }
                }
                catch (err: any) {
                    console.error("error reading field ", {
                        key: f.metadata.key,
                        monday: f.metadata.options.monday,
                        err
                    })

                }



            }
        }
        for (const subItem of item.subitems) {
            let notes = '';
            let quantity = 0;
            let actualQuantity = null;
            let countQuantity = 0;
            //console.log(subItem.column_values);
            for (const col of subItem.column_values) {
                switch (col.id) {
                    case "numbers":
                        quantity = JSON.parse(col.value);
                        break;
                    case "text":
                        notes = JSON.parse(col.value);
                        break;
                    case "dup__of_____":
                        actualQuantity = JSON.parse(col.value);
                        break;
                    case countColumnInItemsInMonday:
                        countQuantity = JSON.parse(col.value || "0");
                        break;

                }
            }
            if (actualQuantity == null)
                actualQuantity = quantity;
            this.items.push({
                id: subItem.id,
                name: subItem.name,
                quantity,
                notes,
                actualQuantity,
                countQuantity
            })
        }




        //console.table(this.$.toArray().map((f) => ({ key: f.metadata.key, value: f.value })))
    }
    @BackendMethod({ allowed: true })
    async signByContact() {

        var orig = new DeliveryFormController(this.remult);
        await orig.load(this.id);
        if (orig.contactSign || !orig.driverSign)
            throw "הטופס אינו מוכן לחתימה";

        this.contactSign = MondayDate.now();
        await this.update(deliveriesBoardNumber, this.id, this.$.contactSign.metadata.options.monday!, JSON.stringify(this.contactSign));
        await DeliveryFormController.createPdfAndUpload(this);
    }
    static createPdfAndUpload = async (data: DeliveryFormController) => { };
    @BackendMethod({ allowed: true })
    async updateDriverPickup() {
        console.table(this.items);
        var orig = new DeliveryFormController(this.remult);
        await orig.load(this.id);
        if (orig.driverSign)
            throw "הטופס כבר חתום";
        this.driverSign = MondayDate.now();
        let value = JSON.stringify(this.driverSign);

        for (const item of this.items) {
            await this.update(itemsBoardNumber, item.id, "dup__of_____", item.actualQuantity);
        }
        await this.update(deliveriesBoardNumber, this.id, this.$.driverSign.metadata.options.monday!, value);
        let counter = +this.signatureCounter;
        if (!counter)
            counter = 1
        else
            counter++;
        await this.update(deliveriesBoardNumber, this.id, this.$.signatureCounter.metadata.options.monday!, counter.toString());
        this.tempSmsResult = await sendSms(this.contactPhone,
            `שלום ${this.contact}, נא לאשר את תכולת הציוד שנאספה עבור מיזם מתחשבים בקישור הבא:
https://mitchashvim-labs.herokuapp.com/contact-sign/${this.id}`
            , this.remult);
        await this.updateDesktopAndLaptopStats()
    }
    async updateDesktopAndLaptopStats() {
        for (const f of [this.$.desktops, this.$.laptops, this.$.screens]) {
            let z = this.items.filter(x => (x.name === f.metadata.caption || f.metadata.options.itemNames?.includes(x.name)) && x.actualQuantity).reduce((prev, x) => prev += +x.actualQuantity, 0);
            if (z != f.value)
                await this.update(deliveriesBoardNumber, this.id, f.metadata.options.monday!, z.toString());
        }
    }
    @BackendMethod({ allowed: true })
    async updateCount() {
        let computers = 0;
        for (const item of this.items) {
            if (item.name === desktop || item.name === laptop) {
                computers += +item.countQuantity;
            }
            await this.update(itemsBoardNumber, item.id, countColumnInItemsInMonday, item.countQuantity.toString());
        }
        await this.update(deliveriesBoardNumber, this.id, countStatusColumnInMonday, JSON.stringify({ index: computers === 0 ? 1 : 0 }));
    }
    @BackendMethod({ allowed: true })
    async cancelSign() {
        var orig = new DeliveryFormController(this.remult);
        await orig.load(this.id);
        if (!orig.driverSign)
            throw "הטופס אינו חתום";
        await this.update(deliveriesBoardNumber, this.id, this.$.driverSign.metadata.options.monday!, "{}");
        await this.update(deliveriesBoardNumber, this.id, this.$.contactSign.metadata.options.monday!, "{}");
        this.driverSign = null;
    }
    async update(board: number, id: number, column_id: string, value: any) {
        const values = { id: +id, value, board, column_id };
        try {
            const result = await gql(values, `#graphql
      mutation ($id: Int!,$value:JSON!,$board:Int!,$column_id:String!) {
   change_column_value(
     item_id:$id
     column_id:$column_id,
     board_id:$board,
     value:$value
   ) {
     id
    name,
    column_values(ids:[$column_id]){
      id
      value
    }
   }
}
         `);
            if (true) {
                var z = undefined;
                if (result?.change_column_value) {
                    z = { ...result.change_column_value }
                    delete z.column_values
                }
                console.log(
                    {
                        values,
                        result: z,
                        column_values: result?.change_column_value?.column_values
                    });

            }
        } catch (err: any) {
            console.error({
                error: values,
                err
            });
        }
    }

}



declare module 'remult' {
    export interface FieldOptions<entityType, valueType> {
        monday?: string,
        itemNames?: string[]
    }
}

export const countStatusColumnInMonday = "status_1";
export const itemsBoardNumber = 2673928289;
export const deliveriesBoardNumber = 2673923561;
export const countColumnInItemsInMonday = "numbers8";
