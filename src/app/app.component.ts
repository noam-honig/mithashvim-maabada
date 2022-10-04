import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, Route, ActivatedRoute } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';

import { UIToolsService } from './common/UIToolsService';
import { openDialog, RouteHelperService } from 'common-ui-elements';
import { User } from './users/user';
import { DataAreaDialogComponent } from './common/data-area-dialog/data-area-dialog.component';
import { terms } from './terms';
import { SignInController } from './users/SignInController';
import { UpdatePasswordController } from './users/UpdatePasswordController';
import { remult } from 'remult';
import { getConfig } from './config/config.component';
import { Roles } from './users/roles';
import { HomeComponent } from './home/home.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    public router: Router,
    public activeRoute: ActivatedRoute,
    private routeHelper: RouteHelperService,
    public uiService: UIToolsService,
    private nav: RouteHelperService) {
  }
  terms = terms;
  remult = remult;

  async signIn() {
    const signIn = new SignInController(remult);
    openDialog(DataAreaDialogComponent, i => i.args = {
      title: terms.signIn,
      object: signIn,
      ok: async () => {
        remult.user = await signIn.signIn();
      }
    });
  }

  isAnyManager() {
    return remult.isAllowed(Roles.anyManager);
  }

  async configTerminal() {
    let input = getConfig();
    const signIn = new SignInController(remult);

    openDialog(DataAreaDialogComponent, i => i.args = {
      title: "הגדרת מסופון",
      fields: [
        { field: signIn.$.user, visible: () => !this.isAnyManager() },
        { field: signIn.$.password, visible: () => !this.isAnyManager() },
        { field: input.$.status, width: "" },
        { field: input.$.employee, visible: () => input.status.updateEmployee }
      ],
      ok: async () => {
        if (input.status.updateEmployee && !input.employee) {
          throw "חובה לבחור עובד";
        }
        else {
          if (!this.isAnyManager())
            remult.user = await signIn.configTerminal(input.status);
          localStorage.setItem('config', JSON.stringify({
            status: input.$.status.inputValue,
            employee: input.$.employee.inputValue
          }));
          this.nav.navigateToComponent(HomeComponent);
          window.location.reload();
        }
      }
    });
  }

  ngOnInit(): void {

  }

  signOut() {
    SignInController.signOut();
    remult.user = undefined;
    this.router.navigate(['/']);
  }

  async updateInfo() {
    let user = await remult.repo(User).findId(remult.user!.id);
    openDialog(DataAreaDialogComponent, i => i.args = {
      title: terms.updateInfo,
      fields: [
        user.$.name
      ],
      ok: async () => {
        await user._.save();
      }
    });
  }
  async changePassword() {
    const updatePassword = new UpdatePasswordController(remult);
    openDialog(DataAreaDialogComponent, i => i.args = {
      title: terms.signIn,
      object: updatePassword,
      ok: async () => {
        await updatePassword.updatePassword();
      }
    });

  }

  routeName(route: Route) {
    let name = route.path;
    if (route.data && route.data['name'])
      name = route.data['name'];
    return name;
  }

  currentTitle() {
    if (this.activeRoute!.snapshot && this.activeRoute!.firstChild)
      if (this.activeRoute.snapshot.firstChild!.data!['name']) {
        return this.activeRoute.snapshot.firstChild!.data['name'];
      }
      else {
        if (this.activeRoute.firstChild.routeConfig)
          return this.activeRoute.firstChild.routeConfig.path;
      }
    return 'angular-starter-project';
  }

  shouldDisplayRoute(route: Route) {
    if (!(route.path && route.path.indexOf(':') < 0 && route.path.indexOf('**') < 0))
      return false;
    return this.routeHelper.canNavigateToRoute(route);
  }
  //@ts-ignore ignoring this to match angular 7 and 8
  @ViewChild('sidenav') sidenav: MatSidenav;
  routeClicked() {
    if (this.uiService.isScreenSmall())
      this.sidenav.close();
  }
}
