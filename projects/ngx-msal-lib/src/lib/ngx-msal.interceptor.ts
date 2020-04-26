import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { AuthError, AuthResponse } from 'msal';
import { from, Observable } from 'rxjs';

import { NGX_MSAL_CONFIG, MsalConfiguration } from './ngx-msal.config';
import { MsalService } from './ngx-msal.service';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';


@Injectable({ providedIn: 'root' })
export class MsalInterceptor implements HttpInterceptor {
  constructor(
    private msalSvc: MsalService,
    @Inject(NGX_MSAL_CONFIG) private msalConfig: MsalConfiguration
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    let scopes = [];
    if (req) {
      scopes = this.getScopesForEndpoint(req.url);
    }

    /**
     * if no scopes are found then the resource is not protected.
     * Therefore no token needs to be attached to the request
     */
    if (scopes === null || scopes.length === 0) {
      return next.handle(req);
    }

    return this.acquireTokenSilentAndCall(req, scopes).pipe(
      mergeMap(response => next.handle(response))
    );
  }

  private getScopesForEndpoint(url: string) {
    let scopes = [];
    const framework = this.msalConfig.framework;

    if (framework.protectedResourceMap.length > 0) {
      framework.protectedResourceMap.forEach(key => {
        if (url.indexOf(key[0]) > -1) {
          scopes.push(key[1]);
        }
      });
    }

    if (framework.unprotectedResources.length > 0) {
      let i;
      for (i of framework.unprotectedResources.length) {
        if (url.indexOf(framework.unprotectedResources[i]) > -1) {
          scopes = [];
        }
      }
    }

    /*
     * default resource will be clientid if nothing specified
     * App will use idtoken for calls to itself
     * check if it's staring from http or https, needs to match with app host
     */
    if (url.indexOf('http://') > -1 || url.indexOf('https://') > -1) {
      if (
        this.getHostFromUrl(url) ===
        this.getHostFromUrl(this.msalSvc.getRedirectUri())
      ) {
        scopes.push([
          this.msalConfig.auth.clientId
        ]);
      }
    } else {
      /*
       * in angular level, the url for $http interceptor call could be relative url,
       * if it's relative call, we'll treat it as app backend call.
       */
      scopes.push([
        this.msalConfig.auth.clientId
      ]);
    }

    return scopes;
  }

  private acquireTokenSilentAndCall(req, scopes) {
    const self = this;
    return from(
      self.msalSvc
        .acquireTokenSilent({ scopes })
        .then((tokenResponse: AuthResponse) => {
          return self.setHeader(req, tokenResponse.accessToken);
        })
        .catch((error: AuthError) => {
          console.error(error.errorMessage);
        })
    );
  }

  private setHeader(req, token) {
    const authHeader = `Bearer ${token}`;
    return req.clone({
      setHeaders: {
        Authorization: authHeader
      }
    });
  }

  private getHostFromUrl(uri: string): string {
    // remove http:// or https:// from uri
    let extractedUri = String(uri).replace(/^(https?:)\/\//, '');
    extractedUri = extractedUri.split('/')[0];
    return extractedUri;
  }
}
