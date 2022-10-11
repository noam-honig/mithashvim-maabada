import { remultExpress } from 'remult/remult-express';
import { createPostgresConnection } from 'remult/postgres';
import { User } from '../app/users/user';
import { SignInController } from '../app/users/SignInController';
import { UpdatePasswordController } from '../app/users/UpdatePasswordController';
import { Employee } from '../app/employees/employee';
import { Computer } from '../app/computers/computer';
import { ChangeLog } from '../app/change-log/change-log';


export const api = remultExpress({
    entities: [Employee, Computer, ChangeLog],
    controllers: [SignInController, UpdatePasswordController],
    getUser: request => request.session!['user'],
    dataProvider: async () => {
        if (process.env['NODE_ENV'] === "production")
            return createPostgresConnection({ configuration: "heroku" })
        return undefined;
    }
});