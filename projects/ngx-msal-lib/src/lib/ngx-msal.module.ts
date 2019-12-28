import { NgModule, ModuleWithProviders } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MsalInterceptor } from './ngx-msal.interceptor';
import { NgxMsalConfig, NGX_MSAL_CONFIG } from './ngx-msal.config';

@NgModule({
  declarations: [],
  imports: [
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
   },
  ],
  exports: []
})
export class MsalModule {
  static forRoot(config: NgxMsalConfig): ModuleWithProviders {
    return {
      ngModule: MsalModule,
      providers: [{ provide: NGX_MSAL_CONFIG, useValue: config }]
    };
  }
}
