import { remultExpress } from 'remult/remult-express';
import { createPostgresConnection } from 'remult/postgres';
import { User } from '../app/users/user';
import { SignInController } from '../app/users/SignInController';
import { UpdatePasswordController } from '../app/users/UpdatePasswordController';
import { Employee } from '../app/employees/employee';
import { Computer } from '../app/computers/computer';
import { ChangeLog } from '../app/change-log/change-log';
import { DeliveryFormController } from '../app/driver-sign/delivery-form.controller';
import { createPdfDocument } from '../app/contact-sign/createPdfDocument';
import { graphqlUploadFile } from '../app/contact-sign/graphqlUploadFile';
import { versionUpdate } from './version';
import { gql } from '../app/driver-sign/getGraphQL';


export const api = remultExpress({
    entities: [Employee, Computer, ChangeLog, User],
    controllers: [SignInController, UpdatePasswordController,
        DeliveryFormController],
    getUser: request => request.session!['user'],
    dataProvider: async () => {
        if (process.env['NODE_ENV'] === "production")
            return createPostgresConnection({ configuration: "heroku" })
        return undefined;
    },
    initApi: async () => {
        await versionUpdate();
        if (false) {
            
            const data = await gql({}, `#graphql
            query  {
              boards(ids: [2673923561]) {
                id
                name
                board_folder_id
                board_kind
                items(limit:1000) {
                  id
                  name}}}`);
            console.log(data.boards[0].items.length);

            for (const item of data.boards[0].items) {
                if (item.id == "3785315001" || true) {
                    let f = new DeliveryFormController();
                    await f.load(+item.id);
                    await f.updateDesktopAndLaptopStats();
                    await new Promise((res) => {
                        setTimeout(() => {
                            res({})
                        }, 5000);
                    })
                }

            }
        }
    }
});
DeliveryFormController.createPdfAndUpload = async (c) => {
    await createPdfDocument(c);
    await graphqlUploadFile(c.id);
}


