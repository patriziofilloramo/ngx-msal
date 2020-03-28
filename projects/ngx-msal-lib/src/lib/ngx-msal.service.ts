import { Inject, Injectable } from "@angular/core";
import { AuthenticationParameters, AuthError, AuthResponse, UserAgentApplication } from "msal";

import { MsalConfiguration, NGX_MSAL_CONFIG, NgxMsalConfig } from "./ngx-msal.config";
import { BroadcastService } from "./utils/broadcast.service";
import { authResponseCallback, tokenReceivedCallback, errorReceivedCallback} from 'msal/lib-commonjs/UserAgentApplication';
@Injectable({
  providedIn: "root"
})
export class MsalService extends UserAgentApplication {
  private _authconfig: MsalConfiguration;
  private _requestAuthParams: AuthenticationParameters;

  constructor(
    @Inject(NGX_MSAL_CONFIG)
    private _coreConfig: NgxMsalConfig,
    private _broadcastSvc: BroadcastService
  ) {
    super(_coreConfig.config);
    this._authconfig = _coreConfig.config;
    this._requestAuthParams = {
      scopes: this._authconfig.framework.consentScopes
    };
  }

  /**
   * Acquire token for the given scopes
   * @param request { scopes : [xxxx] }
   */
  public acquireTokenSilent(
    request: AuthenticationParameters
  ): Promise<AuthResponse> {
    return super
      .acquireTokenSilent(request)
      .then((authResponse: AuthResponse) => {
        this._broadcastSvc.broadcast("msal:acquireTokenSuccess", authResponse);
        return authResponse;
      })
      .catch((error: AuthError) => {
        this._broadcastSvc.broadcast("msal:acquireTokenFailure", error);
        throw error;
      });
  }

  /**
   * login with popup and return a promise
   */
  public loginPopup(request?: AuthenticationParameters): Promise<AuthResponse> {
    return super
      .loginPopup(request)
      .then((authResponse: AuthResponse) => {
        this._broadcastSvc.broadcast("msal:loginSuccess", authResponse);
        return authResponse;
      })
      .catch((error: AuthError) => {
        this._broadcastSvc.broadcast("msal:loginFailure", error);
        throw error;
      });
  }

  /**
   * sign in with popup (non-ie) using consent scopes of the configuration
   */
  public signInPopup(): Promise<AuthResponse> {
    return this.loginPopup(this._requestAuthParams);
  }

  /**
   * sign in with redirect using consent scopes of the configuration
   */
  public signInRedirect(): void {
    this.loginRedirect(this._requestAuthParams);
  }

    /**
   * sign in 
   */
  public signIn(): Promise<AuthResponse> | void {
    if(this._authconfig.framework.popUp) {
      return this.loginPopup();
    } else {
      this.loginRedirect(this._requestAuthParams);
    }
  }

  
  handleRedirectCallback(tokenReceivedCallback: tokenReceivedCallback, errorReceivedCallback: errorReceivedCallback): void;
  handleRedirectCallback(authCallback: authResponseCallback): void;
  handleRedirectCallback(authOrTokenCallback: authResponseCallback | tokenReceivedCallback, errorReceivedCallback?: errorReceivedCallback): void {
      super.handleRedirectCallback((authError: AuthError, authResponse: AuthResponse) => {
          if (authResponse) {
              if (authResponse.tokenType === "id_token") {
                  this._broadcastSvc.broadcast("msal:loginSuccess", authResponse);
              } else {
                  this._broadcastSvc.broadcast("msal:acquireTokenSuccess", authResponse);
              }

              if (errorReceivedCallback) {
                  (authOrTokenCallback as tokenReceivedCallback)(authResponse);
              } else {
                  (authOrTokenCallback as authResponseCallback)(null, authResponse);
              }

          } else if (authError) {
              if (authResponse.tokenType === "id_token") {
                  this._broadcastSvc.broadcast("msal:loginFailure", authError);

              } else {
                  this._broadcastSvc.broadcast("msal:acquireTokenFailure", authError);
              }

              if (errorReceivedCallback) {
                  errorReceivedCallback(authError, authResponse.accountState);
              } else {
                  (authOrTokenCallback as authResponseCallback)(authError);
              }

          }
      });
  }


  /**
   * log out
   */
  public signOut() {
    return super.logout();
  }

  /**
   * log out
   */
  public logOut() {
    return super.logout;
  }
}
