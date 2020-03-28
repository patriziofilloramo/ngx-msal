import { Injectable, Inject } from "@angular/core";
import {
  UserAgentApplication,
  AuthenticationParameters,
  AuthResponse,
  AuthError
} from "msal";
import {
  NGX_MSAL_CONFIG,
  NgxMsalConfig,
  MsalConfiguration
} from "./ngx-msal.config";
import { BroadcastService } from "./utils/broadcast.service";

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
