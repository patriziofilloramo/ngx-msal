import { Injectable, Inject } from '@angular/core';
import {
  UserAgentApplication,
  AuthenticationParameters,
  AuthResponse,
  AuthError,
} from 'msal';
import { NGX_MSAL_CONFIG, MsalConfiguration } from './ngx-msal.config';
import { BroadcastService } from './utils/broadcast.service';

@Injectable({
  providedIn: 'root',
})
export class MsalService extends UserAgentApplication {
  private requestAuthParams: AuthenticationParameters;

  constructor(
    @Inject(NGX_MSAL_CONFIG)
    private coreConfig: MsalConfiguration,
    private broadcastSvc: BroadcastService
  ) {
    super(coreConfig);
    this.requestAuthParams = {
      scopes: coreConfig.framework.consentScopes,
    };
  }

  public acquireTokenSilent(
    request: AuthenticationParameters
  ): Promise<AuthResponse> {
    return super
      .acquireTokenSilent(request)
      .then((authResponse: AuthResponse) => {
        this.broadcastSvc.broadcast('msal:acquireTokenSuccess', authResponse);
        return authResponse;
      })
      .catch((error: AuthError) => {
        this.broadcastSvc.broadcast('msal:acquireTokenFailure', error);
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
        this.broadcastSvc.broadcast('msal:loginSuccess', authResponse);
        return authResponse;
      })
      .catch((error: AuthError) => {
        this.broadcastSvc.broadcast('msal:loginFailure', error);
        throw error;
      });
  }

  /**
   * sign in with popup (non-ie) using consent scopes of the configuration
   */
  public signInPopup(): Promise<AuthResponse> {
    return this.loginPopup(this.requestAuthParams);
  }

  /**
   * sign in with redirect using consent scopes of the configuration
   */
  public signInRedirect(): void {
    this.loginRedirect(this.requestAuthParams);
  }

  /**
   * sign in
   */
  public signIn(): Promise<AuthResponse> | void {
    if (this.coreConfig.framework.popUp) {
      return this.loginPopup();
    } else {
      this.loginRedirect(this.requestAuthParams);
    }
  }

  public urlContainsHash(url: string) {
      return super.urlContainsHash(url);
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
