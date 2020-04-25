import { Inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
} from '@angular/router';
import {
  AuthenticationParameters,
  AuthError,
  AuthResponse,
  InteractionRequiredAuthError,
} from 'msal';
import { Location } from '@angular/common';

import { MsalConfiguration, NGX_MSAL_CONFIG } from './ngx-msal.config';
import { MsalService } from './ngx-msal.service';
import { WindowUtils } from 'msal/lib-commonjs/utils/WindowUtils';
import { UrlUtils } from 'msal/lib-commonjs/utils/UrlUtils';

@Injectable({
  providedIn: 'root',
})
export class MsalGuard implements CanActivate {
  private requestAuthParams: AuthenticationParameters;

  constructor(
    private msalSvc: MsalService,
    private location: Location,
    @Inject(NGX_MSAL_CONFIG) private msalConfig: MsalConfiguration
  ) {
    this.requestAuthParams = {
      scopes: this.msalConfig.framework.consentScopes,
      extraQueryParameters: this.msalConfig.framework.extraQueryParameters,
    };
  }

  /**
   * Builds the absolute url for the destination page
   * @param path Relative path of requested page
   * @returns Full destination url
   */
  private getDestinationUrl(path: string): string {
    // Absolute base url for the application (default to origin if base element not present)
    const baseElements = document.getElementsByTagName('base');
    const baseUrl = this.location.normalize(
      baseElements.length ? baseElements[0].href : window.location.origin
    );

    // Path of page (including hash, if using hash routing)
    const pathUrl = this.location.prepareExternalUrl(path);

    // Hash location strategy
    if (pathUrl.startsWith('#')) {
      return `${baseUrl}/${pathUrl}`;
    }

    // If using path location strategy, pathUrl will include the relative portion of the base path (e.g. /base/page).
    // Since baseUrl also includes /base, can just concatentate baseUrl + path
    return `${baseUrl}${path}`;
  }

  /**
   * Interactively prompt the user to login
   * @param url Path of the requested page
   */
  private async loginInteractively(url: string) {
    if (this.msalConfig.framework.popUp) {
      return this.msalSvc
        .loginPopup({
          scopes: this.msalConfig.framework.consentScopes,
          extraQueryParameters: this.msalConfig.framework.extraQueryParameters,
        })
        .then(() => true)
        .catch(() => false);
    }

    const redirectStartPage = this.getDestinationUrl(url);

    this.msalSvc.loginRedirect({
      redirectStartPage,
      scopes: this.msalConfig.framework.consentScopes,
      extraQueryParameters: this.msalConfig.framework.extraQueryParameters,
    });
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Promise<boolean> {
    // If a page with MSAL Guard is set as the redirect for acquireTokenSilent,
    // short-circuit to prevent redirecting or popups.
    if (
      UrlUtils.urlContainsHash(window.location.hash) &&
      WindowUtils.isInIframe()
    ) {
      return false;
    }

    if (!this.msalSvc.getAccount()) {
      return this.loginInteractively(state.url);
    }

    return this.msalSvc
      .acquireTokenSilent({
        scopes: [this.msalConfig.auth.clientId],
      })
      .then(() => true)
      .catch((error: AuthError) => {
        if (
          InteractionRequiredAuthError.isInteractionRequiredError(
            error.errorCode
          )
        ) {
          console.log(
            `Interaction required error in MSAL Guard, prompting for interaction.`
          );
          return this.loginInteractively(state.url);
        }


        /**
         * "block_token_requests" error code can be ignored.
         * Msal is blocking calls when they are fired from an iframe
         */
        if (
          error &&
          error.errorCode &&
          error.errorCode !== 'block_token_requests'
        ) {
          console.error(
            'MsalGuard - Acquire token silent error. Error code:',
            error.errorCode
          );
        }

        /* workaround: multiple instance running together at the same time may have create
                    duplicated localstorage token entries with the same values. We can ignore it. */
        if (error.errorCode === 'multiple_matching_tokens') {
          return true;
        }
        throw error;
      });
  }
}
