import { InjectionToken } from '@angular/core';
import { Configuration } from 'msal';


export const NGX_MSAL_CONFIG = new InjectionToken('NGX_MSAL_CONFIG');

export interface MsalConfiguration extends Configuration {
  framework: FrameworkOpts;
}

export interface FrameworkOptions {
  isAngular?: boolean;
  unprotectedResources?: Array<string>;
  protectedResourceMap?: Map<string, Array<string>>;
}

export interface FrameworkOpts extends FrameworkOptions {
  extraQueryParameters?: any;
  consentScopes: any;
  protectedResourceMap: any;
  unprotectedResources: any;
  popUp?: boolean;
}
