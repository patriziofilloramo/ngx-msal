import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { AuthResponse, AuthError } from "msal";
import { from } from "rxjs";
import { Observable } from "rxjs/internal/Observable";
import { mergeMap } from 'rxjs/operators';
import { NgxMsalConfig, NGX_MSAL_CONFIG } from './ngx-msal.config';
import { MsalService } from './ngx-msal.service';



@Injectable({ providedIn: "root" })
export class NgxMsalInterceptor implements HttpInterceptor {
  constructor(
    private _msalSvc: MsalService,
    @Inject(NGX_MSAL_CONFIG) private cockpitConfig: NgxMsalConfig
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    var scopes = this.getScopesForEndpoint(req.url);
    /**
     * if no scopes are found then the resource is not protected.
     * Therefore no token needs to be attached to the request
     */
    if (scopes === null || scopes.length == 0) {
      return next.handle(req);
    }

    return this.acquireTokenSilentAndCall(req, scopes).pipe(
      mergeMap(response => next.handle(response))
    );
  }

  private getScopesForEndpoint(url: string) {
    var scopes = [];
    var framework = this.cockpitConfig.config.framework;

    if (framework.protectedResourceMap.length > 0) {
      framework.protectedResourceMap.forEach(key => {
        if (url.indexOf(key[0]) > -1) {
          scopes.push(key[1]);
        }
      });
    }

    if (framework.unprotectedResources.length > 0) {
      for (let i = 0; i < framework.unprotectedResources.length; i++) {
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
    if (url.indexOf("http://") > -1 || url.indexOf("https://") > -1) {
      if (
        this.getHostFromUrl(url) ===
        this.getHostFromUrl(this._msalSvc.getRedirectUri())
      ) {
        scopes.push([
          this.cockpitConfig.config.auth.clientId
        ]);
      }
    } else {
      /*
       * in angular level, the url for $http interceptor call could be relative url,
       * if it's relative call, we'll treat it as app backend call.
       */
      scopes.push([
        this.cockpitConfig.config.auth.clientId
      ]);
    }

    return scopes;
  }

  private acquireTokenSilentAndCall(req, scopes) {
    var self = this;
    return from(
      self._msalSvc
        .acquireTokenSilent({ scopes: scopes })
        .then((tokenResponse: AuthResponse) => {
          return self.setHeader(req, tokenResponse.accessToken);
        })
        .catch((error: AuthError) => {
          console.error(error.errorMessage)
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
    let extractedUri = String(uri).replace(/^(https?:)\/\//, "");
    extractedUri = extractedUri.split("/")[0];
    return extractedUri;
  }
}
