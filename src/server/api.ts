import { remultExpress } from 'remult/remult-express';
import { createPostgresConnection } from 'remult/postgres';
import { User } from '../app/users/user';
import { SignInController } from '../app/users/SignInController';
import { UpdatePasswordController } from '../app/users/UpdatePasswordController';
import { Employee } from '../app/employees/employee';
import { Computer } from '../app/computers/computer';
import { ChangeLog } from '../app/change-log/change-log';
import { DataRefreshController } from '../app/data-refresh/data-refresh.controller';
import { DeliveryFormController } from '../app/driver-sign/delivery-form.controller';
import { createPdfDocument } from '../app/contact-sign/createPdfDocument';
import { graphqlUploadFile } from '../app/contact-sign/graphqlUploadFile';
import { versionUpdate } from './version';


export const api = remultExpress({
    entities: [Employee, Computer, ChangeLog, User],
    controllers: [SignInController, UpdatePasswordController, DataRefreshController,
        DeliveryFormController],
    getUser: request => request.session!['user'],
    dataProvider: async () => {
        if (process.env['NODE_ENV'] === "production")
            return createPostgresConnection({ configuration: "heroku" })
        return undefined;
    },
    initApi: async () => {
        await versionUpdate();
        await Computer.getDonors()
        
    }
});
DeliveryFormController.createPdfAndUpload = async (c) => {
    await createPdfDocument(c);
    await graphqlUploadFile(c.id);
}
