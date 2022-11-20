import { AuthenticatedGuard } from 'common-ui-elements';
import { Injectable } from '@angular/core';
import { Roles } from './roles';



@Injectable()
export class AdminGuard extends AuthenticatedGuard {

    override isAllowed() {
        return Roles.admin;
    }
}

@Injectable({ providedIn: 'root' })
export class ComputersGuard extends AuthenticatedGuard {
    override isAllowed() {
        return Roles.viewComputers;
    }
}

@Injectable({ providedIn: 'root' })
export class EmployeesGuard extends AuthenticatedGuard {
    override isAllowed() {
        return Roles.manageEmployees;
    }
}

@Injectable({ providedIn: 'root' })
export class AnyManagerGuard extends AuthenticatedGuard {
    override isAllowed() {
        return Roles.anyManager;
    }
}
@Injectable({ providedIn: 'root' })
export class StockAdminGuard extends AuthenticatedGuard {
    override isAllowed() {
        return Roles.stockAdmin;
    }
}