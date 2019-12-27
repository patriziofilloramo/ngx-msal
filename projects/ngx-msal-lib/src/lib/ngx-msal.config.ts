import { InjectionToken } from "@angular/core";
import { Configuration } from 'msal';
import { FrameworkOptions } from 'msal/lib-commonjs/Configuration';


export const NGX_MSAL_CONFIG = new InjectionToken("NGX_MSAL_CONFIG");

export interface NgxMsalConfig {
  config: MsalConfiguration;
}

export interface MsalConfiguration extends Configuration {
  framework: FrameworkOpts;
}

export interface FrameworkOpts extends FrameworkOptions {
  extraQueryParameters?: any;
  consentScopes: any;
  protectedResourceMap: any;
  unprotectedResources: any;
  popUp?: boolean;
}