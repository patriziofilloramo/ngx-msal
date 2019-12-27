# Ngx-Msal

**Important**: 
 
This is an Angular wrapper of the [Msal JavaScript authentication library](https://github.com/AzureAD/microsoft-authentication-library-for-js) created for enabling the usage of Msal.js library v1.2 also for Angular >6 apps. I created it in my free time, I cannot promise to regular maintain it. :-)

The original Msal.js library is created by Microsoft, their official Angular wrapper currently is not supporting Angular 6 or higher.
If your app runs Angular version 5 (or below) you may consider the [official Msal Angular Wrapper](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/README.md) created by Microsoft.

The Microsoft Authentication Library for JavaScript enables client-side JavaScript web applications, running in a web browser, to authenticate users using Azure AD for work and school accounts (AAD), Microsoft personal accounts (MSA), and social identity providers like Facebook, Google, LinkedIn, Microsoft accounts, etc. through Azure AD B2C service. It also enables your app to get tokens to access Microsoft Cloud services such as Microsoft Graph.

## Installation
The msal-angular package is available on NPM:

`npm install @ngx-angular --save`

## Usage

#### Prerequisite

Before using MSAL.js, [register an application in Azure AD](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app) to get your clientID.

#### 1. Include and initialize the MSAL module in your app module.
Import MsalModule into app.module.ts. To initialize MSAL module you are required to pass the clientID of your application which you can get from the application registration.

```js
@NgModule({
  imports: [ MsalModule.forRoot({
                    clientID: "Your client ID"
                })]
         })

  export class AppModule { }
```

#### 2. Secure the routes in your application
You can add authentication to secure specific routes in your application by just adding `canActivate : [MsalGuard]` to your route definition. It can be added at the parent or child routes.

```js
 { path: 'product', component: ProductComponent, canActivate : [MsalGuard],
    children: [
      { path: 'detail/:id', component: ProductDetailComponent  }
    ]
   },
  { path: 'profile' ,component: ProfileComponent, canActivate : [MsalGuard] },
```

When user visits these routes, the library prompts the user to authenticate.

#### 3. Get tokens for Web API calls
MSAL Angular allows you to add an Http interceptor (`MsalInterceptor`) in your app.module.ts as follows. MsalInterceptor will obtain tokens and add them to all your Http requests in API calls except the API endpoints listed as `unprotectedResources`.

```js
providers: [ ProductService, {
        provide: HTTP_INTERCEPTORS,
        useClass: MsalInterceptor,
        multi: true
    }
   ],
 ```

Using MsalInterceptor is optional and you can write your own interceptor if you choose to. Alternatively, you can also explicitly acquire tokens using the acquireToken APIs.

#### 4. Subscribe to event callbacks

MSAL wrapper provides below callbacks for various operations. For all callbacks, you need to inject BroadcastService as a dependency in your component/service.

1. loginPopup()/loginRedirect using api or using routes.

```js
this.broadcastSvc.subscribe("msal:loginFailure", (error: AuthError) => {
// do something here
});

this.broadcastSvc.subscribe("msal:loginSuccess", (response: AuthResponse) => {
// do something here
});
```

2. acquireTokenSilent()/acquireTokenPopup()/acquireTokenRedirect()

```js
this.broadcastSvc.subscribe("msal:acquireTokenSuccess", (response: AuthResponse) => {
     // do something here
});

this.broadcastSvc.subscribe("msal:acquireTokenFailure", (error: AuthError) => {
      // do something here
});
```

3. It is extremely important to unsubscribe. Implement ngOnDestroy() in your component and unsubscribe.

```js
 private subscription: Subscription;

 this.subscription=  this.broadcastSvc.subscribe("msal:acquireTokenFailure", (payload) => {
 });

 ngOnDestroy() {
    this.broadcastSvc.getMSALSubject().next(1);
    if(this.subscription) {
      this.subscription.unsubscribe();
    }
  }
```




## Author
Patrizio Filloramo

