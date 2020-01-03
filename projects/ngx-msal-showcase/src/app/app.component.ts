import { Component, OnDestroy, OnInit } from '@angular/core';
import { Account, AuthError, AuthResponse, BroadcastService, MsalService } from 'ngx-msal-lib';
import { Subscription } from 'rxjs/internal/Subscription';
import { environment } from '../environments/environment';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {

  private _subscriptions: Subscription = new Subscription();
  public account: Account;

  constructor(
    private _msalSvc: MsalService,
    private _broadcastSvc: BroadcastService,
    private _appSvc: AppService) {
     this.account = this._msalSvc.getAccount();

     /**
      * with the "!isCallbackOrIframe()" we avoid unwanted calls 
      * when the code execution is inside callbacks or iframe
      * */ 
     if(this.account && !this.isCallbackOrIframe()) {
       this._appSvc.getUserData();
     }
  }


  ngOnInit(): void {

    this._msalSvc.handleRedirectCallback(this.authRedirectCallBack);

    this._subscriptions.add(
      this._broadcastSvc.subscribe("msal:loginSuccess", (response: AuthResponse) => {
        console.log('login success. Response: ', response);
        this._appSvc.getUserData();
      })
    );

    this._subscriptions.add(
      this._broadcastSvc.subscribe("msal:loginFailure", (error: AuthError) => {
        console.log('login failure. Response: ', error.errorMessage);
      })
    );

    this._subscriptions.add(
      this._broadcastSvc.subscribe("msal:acquireTokenFailure", (error: AuthError) => {
        console.log('acquire token failure. Response: ', error.errorMessage);
      })
    );
  }


  private authRedirectCallBack(error: AuthError, response: AuthResponse) {

    if (error) {
      console.log("authRedirectCall Error: ", error);
    } else {
      if (response.tokenType === "id_token") {
        console.log("authRedirectCall ID_TOKEN: ", response);
      } else if (response.tokenType === "access_token") {
        console.log("authRedirectCall ACCESS_TOKEN: ", response);
      }
    }
  }

  public isCallbackOrIframe(): boolean {
    const iframe = window != window.parent && !window.opener;
    const callback = this._msalSvc.isCallback(window.location.hash)
    if (environment.isIE) {
      return ( iframe || callback);
    } else {
      return iframe;
    }
  }


  ngOnDestroy(): void {
    this._broadcastSvc.getMSALSubject().next(1);
    this._subscriptions.unsubscribe();
  }

}
