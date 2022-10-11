import { Allow, BackendMethod, Controller, ControllerBase, Fields, remult, UserInfo, Validators } from "remult";
import { terms } from "../terms";
import { Roles } from "./roles";
import { User } from "./user";
import { getRequest } from "../../server/getRequest";
import { ComputerStatus } from "../computers/computer";

@Controller('signIn')
export class SignInController extends ControllerBase {



    @Fields.string({
        caption: terms.username,
        validate: Validators.required
    })
    user = '';
    @Fields.string({
        caption: terms.password,
        validate: Validators.required,
        inputType: 'password'
    })
    password = '';

    @Fields.boolean({
        caption: terms.rememberOnThisDevice,
    })
    rememberOnThisDevice = false;



    @BackendMethod({ allowed: true })
    /**
     * This sign mechanism represents a simplistic sign in management utility with the following behaviors
     * 1. The first user that signs in, is created as a user and is determined as admin.
     * 2. When a user that has no password signs in, that password that they've signed in with is set as the users password
     */
    async signIn() {
        let result: UserInfo | undefined = await this.validateUserButDoNotSignIn();
        return SignInController.setSessionUser(result, this.rememberOnThisDevice);
    }

    private static setSessionUser(user: UserInfo, remember?: boolean) {
        const req = getRequest();
        req.session!['user'] = user;
        if (remember)
            req.sessionOptions.maxAge = 365 * 24 * 60 * 60 * 1000; //remember for a year
        return user;
    }

    @BackendMethod({ allowed: true })
    async validateUserButDoNotSignIn() {
        let result: UserInfo | undefined;
        const userRepo = remult.repo(User);
        let u = await userRepo.findFirst({ name: this.user });
        if (!u) {
            if (await userRepo.count() === 0) { //first ever user is the admin
                u = await userRepo.insert({
                    name: this.user,
                    admin: true
                });
            }
        }
        if (u) {
            if (!u.password) { // if the user has no password defined, the first password they use is their password
                u.hashAndSetPassword(this.password);
                await u.save();
            }

            if (await u.passwordMatches(this.password)) {
                const roles = [Roles.anyManager];
                result = {
                    id: u.id,
                    roles: roles,
                    name: u.name
                };
                if (u.admin)
                    roles.push(Roles.admin, Roles.updateComputers);

                if (u.admin || u.stockAdmin)
                    roles.push(Roles.stockAdmin,
                        Roles.viewComputers);
                if (u.admin || u.upgradeAdmin)
                    roles.push(Roles.upgradeAdmin,
                        Roles.viewComputers,
                        Roles.manageEmployees);
                if (u.admin || u.packAdmin)
                    roles.push(Roles.packAdmin)
            }
        }
        if (!result)
            throw new Error(terms.invalidSignIn);
        return result;
    }
    @BackendMethod({ allowed: true })
    async configTerminal(status: ComputerStatus): Promise<UserInfo> {

        let result = await this.validateUserButDoNotSignIn();
        remult.user = result;
        if (!remult.isAllowed(Roles.anyManager))
            throw "אינך מורשה להגדיר טרמינל";
        return SignInController.switchToTerminalMode(status);

    }
    @BackendMethod({ allowed: Roles.anyManager })
    static async switchToTerminalMode(status: ComputerStatus) {
        return SignInController.setSessionUser({
            id: "!terminal:" + status.caption,
            name: "מסופון"
        }, true);
    }
    @BackendMethod({ allowed: Allow.authenticated })
    static signOut() {
        getRequest().session!['user'] = undefined;
    }
    @BackendMethod({ allowed: true })
    static currentUser() {
        return remult.user;
    }
}