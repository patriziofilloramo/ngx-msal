import { Inject, Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from "@angular/router";
import { AuthenticationParameters, AuthError, AuthResponse } from 'msal';

import { MsalConfiguration, NGX_MSAL_CONFIG, NgxMsalConfig } from './ngx-msal.config';
import { MsalService } from './ngx-msal.service';

@Injectable({
    providedIn: 'root'
})
export class MsalGuard implements CanActivate {
    private _msalConfig: MsalConfiguration;
    private _requestAuthParams: AuthenticationParameters;

    constructor( 
        private _msalSvc: MsalService,
        @Inject(NGX_MSAL_CONFIG) private msalConfig: NgxMsalConfig) 
    {
        this._msalConfig = this.msalConfig.config;
        this._requestAuthParams = {
            scopes: this._msalConfig.framework.consentScopes,
            extraQueryParameters: this._msalConfig.framework.extraQueryParameters
        };
    }

    
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Promise<boolean> {

        if (!this._msalSvc.getAccount() ) {
                if (this._msalConfig.framework.popUp) {
                    return this._msalSvc.loginPopup(this._requestAuthParams)
                        .then(() => true)
                        .catch(() => false);
                }
                else {
                    this._msalSvc.loginRedirect(this._requestAuthParams);
                }
            }
        else {
            return this._msalSvc.acquireTokenSilent({ 
                scopes: [this._msalConfig.auth.clientId], 
                authority: this._msalConfig.auth.authority
            })
            .then((result: AuthResponse) => {
                    return true;
                })
                .catch((error: AuthError) => {
                    /**
                     * "block_token_requests" error code can be ignored. 
                     * Msal is blocking calls when they are fired from an iframe
                     * */
                    if (error && error.errorCode && error.errorCode !== 'block_token_requests') {
                        console.error('MsalGuard - Acquire token silent error. Error code:', error.errorCode);                  
                    }

                    /* workaround: multiple instance running together at the same time may have create
                    duplicated localstorage token entries with the same values. We can ignore it. */
                    if (error.errorCode === 'multiple_matching_tokens') return true;
                    
                    return false;
                });
        }

    }
}
