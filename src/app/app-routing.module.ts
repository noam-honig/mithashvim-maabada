import { RemultModule } from '@remult/angular';
import { NgModule, ErrorHandler } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';


import { UsersComponent } from './users/users.component';
import { AdminGuard } from "./users/AdminGuard";
import { ShowDialogOnErrorErrorHandler } from './common/dialog';
import { JwtModule } from '@auth0/angular-jwt';
import { AuthService } from './auth.service';
import { terms } from './terms';
import { Employee } from './employees/employee';
import { EmployeesComponent } from './employees/employees.component';
import { ComputersComponent } from './computers/computers.component';
import { TrashComponent } from './trash/trash.component';
import { OkComponent } from './ok/ok.component';
import { AutoRefreshListComponent } from './auto-refresh-list/auto-refresh-list.component';

const defaultRoute = 'שיוך לעובד משדרג';
const routes: Routes = [
  { path: defaultRoute, component: HomeComponent },
  { path: 'עמדת גריטה', component: TrashComponent },
  { path: 'עמדת שדרוג בהצלחה', component: OkComponent },
  { path: 'רשימה מתרעננת', component: AutoRefreshListComponent },
  { path: 'מחשבים', component: ComputersComponent },
  { path: 'עובדים', component: EmployeesComponent },
  { path: terms.userAccounts, component: UsersComponent, canActivate: [AdminGuard] },
  { path: '**', redirectTo: '/' + defaultRoute, pathMatch: 'full' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes),
    RemultModule,
  JwtModule.forRoot({
    config: { tokenGetter: () => AuthService.fromStorage() }
  })],
  providers: [AdminGuard, { provide: ErrorHandler, useClass: ShowDialogOnErrorErrorHandler }],
  exports: [RouterModule]
})
export class AppRoutingModule { }
