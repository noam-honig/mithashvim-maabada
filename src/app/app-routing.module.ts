import { CommonUIElementsModule } from 'common-ui-elements';
import { NgModule, ErrorHandler } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';


import { UsersComponent } from './users/users.component';
import { AdminGuard, AnyManagerGuard, ComputersGuard, EmployeesGuard } from "./users/AdminGuard";
import { ShowDialogOnErrorErrorHandler } from './common/UIToolsService';
import { terms } from './terms';
import { EmployeesComponent } from './employees/employees.component';
import { ComputersComponent } from './computers/computers.component';
import { AutoRefreshListComponent } from './auto-refresh-list/auto-refresh-list.component';
import { ContactSignComponent } from './contact-sign/contact-sign.component';
import { DriverSignComponent } from './driver-sign/driver-sign.component';

const defaultRoute = 'מסופון';
const routes: Routes = [
  { path: defaultRoute, component: HomeComponent },
  { path: 'רשימה מתרעננת', component: AutoRefreshListComponent, canActivate: [AnyManagerGuard] },
  { path: 'מחשבים', component: ComputersComponent, canActivate: [ComputersGuard] },
  { path: 'עובדים', component: EmployeesComponent, canActivate: [EmployeesGuard] },
  { path: 'contact-sign/:id', component: ContactSignComponent, data: { show: true } },
  { path: 'driver-sign/:id', component: DriverSignComponent, data: { show: true } },
  { path: terms.userAccounts, component: UsersComponent, canActivate: [AdminGuard] },
  { path: '**', redirectTo: '/' + defaultRoute, pathMatch: 'full' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes),
    CommonUIElementsModule],
  providers: [AdminGuard, { provide: ErrorHandler, useClass: ShowDialogOnErrorErrorHandler }],
  exports: [RouterModule]
})
export class AppRoutingModule { }