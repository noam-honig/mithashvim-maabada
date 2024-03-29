import { APP_INITIALIZER, NgModule, NgZone } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CommonUIElementsModule } from 'common-ui-elements';
import { UsersComponent } from './users/users.component';
import { HomeComponent } from './home/home.component';
import { YesNoQuestionComponent } from './common/yes-no-question/yes-no-question.component';
import { DataAreaDialogComponent } from './common/data-area-dialog/data-area-dialog.component';
import { UIToolsService } from './common/UIToolsService';
import { AdminGuard } from "./users/AdminGuard";
import { remult } from 'remult';
import { SignInController } from './users/SignInController';
import { TextAreaDataControlComponent } from './common/textarea-data-control/textarea-data-control.component';
import { EmployeesComponent } from './employees/employees.component';
import { AssignEmployeeComponent } from './assign-employee/assign-employee.component';
import { ComputersComponent } from './computers/computers.component';
import { ChangeLogComponent } from './change-log/change-log.component';
import { CardInMiddleComponent } from './card-in-middle/card-in-middle.component';
import { AutoRefreshListComponent } from './auto-refresh-list/auto-refresh-list.component';
import { MatTableModule } from "@angular/material/table";
import { DriverSignComponent } from './driver-sign/driver-sign.component';
import { ContactSignComponent } from './contact-sign/contact-sign.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AssignToPalletComponent } from './assign-to-pallet/assign-to-pallet.component';
import { CountItemsComponent } from './count-items/count-items.component';
import { SelectDonorComponent } from './select-donor/select-donor.component';
import { DotsMenuComponent } from './common/dot-menu.component';
import { UpdatePalletStatusComponent } from './update-pallet-status/update-pallet-status.component';


@NgModule({
  declarations: [
    AppComponent,
    UsersComponent,
    HomeComponent,
    YesNoQuestionComponent,
    DataAreaDialogComponent,
    TextAreaDataControlComponent,
    EmployeesComponent,
    AssignEmployeeComponent,
    ComputersComponent,
    ChangeLogComponent,
    CardInMiddleComponent,
    AutoRefreshListComponent,
    DriverSignComponent,
    ContactSignComponent,
    DashboardComponent,
    AssignToPalletComponent,
    CountItemsComponent,
    SelectDonorComponent,
    DotsMenuComponent,
    UpdatePalletStatusComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    CommonUIElementsModule
  ],
  providers: [
    UIToolsService,
    AdminGuard,
    { provide: APP_INITIALIZER, useFactory: initApp, multi: true }],
  bootstrap: [AppComponent],
  entryComponents: [YesNoQuestionComponent, DataAreaDialogComponent]
})
export class AppModule {
  constructor(zone: NgZone) {
    remult.apiClient.wrapMessageHandling = x => zone.run(() => x())
  }
}

export function initApp() {
  const loadCurrentUserBeforeAppStarts = async () => {
    remult.user = await SignInController.currentUser();
  };
  return loadCurrentUserBeforeAppStarts;
}