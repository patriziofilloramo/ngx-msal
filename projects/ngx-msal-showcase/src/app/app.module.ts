import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MsalConfiguration, MsalModule, MsalInterceptor } from 'ngx-msal-lib';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainComponent } from './components/main/main.component';
import { ProfileComponent } from './components/profile/profile.component';

const isIE =
  window.navigator.userAgent.indexOf('MSIE ') > -1 ||
  window.navigator.userAgent.indexOf('Trident/') > -1;

export const msalConfig: MsalConfiguration = {
  auth: {
    // clientId: "YOUR_AZUREAPP_CLIENT_ID_HERE",
    // authority:
    //   "https://login.microsoftonline.com/XXXXXXXXXXX",
    clientId: 'aaf3f968-94f2-454f-9d58-aa4571e1c880',
    authority:
      'https://login.microsoftonline.com/scientificnet.onmicrosoft.com/',
    validateAuthority: true,
    // redirectUri: 'https://localhost:4200/#/redirect',
    navigateToLoginRequestUrl: true
  },
  cache: {
    cacheLocation: 'localStorage' as any,
    storeAuthStateInCookie: true
  },
  framework: {
    popUp: false,
    protectedResourceMap: [['https://graph.microsoft.com', ['User.Read']]],
    unprotectedResources: ['https://www.microsoft.com/en-us/'],
    consentScopes: ['User.Read', 'openid'],

  }
};


@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MsalModule.forRoot(msalConfig),
    HttpClientModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
