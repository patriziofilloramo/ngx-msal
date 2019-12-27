import { Component, OnInit } from "@angular/core";
import { MsalService, AuthResponse, AuthError } from "ngx-msal-lib";
import { AppService } from "../../app.service";

@Component({
  selector: "app-main",
  templateUrl: "./main.component.html"
})
export class MainComponent {
  public title = "Ngx-Msal Showcase";

  constructor(
    private _msalSvc: MsalService,
    public appSvc: AppService
  ) {}

  login() {
    this._msalSvc.signInPopup()
    .then((response: AuthResponse) => {
      // do stuff afer logged in...
    })
    .catch((error: AuthError) => {
      console.error(error.errorMessage);
    });
  }

  logout() {
    this._msalSvc.logout();
  }

}
