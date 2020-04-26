import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService implements OnDestroy {

  // tslint:disable-next-line: variable-name
  private _userData;
  private subscriptions: Subscription = new Subscription();
  private microsoftGraphUrl = 'https://graph.microsoft.com/v1.0';

  get userData(): any {
    return this._userData;
  }
  set userData(value: any) {
    this._userData = value;
  }

  constructor(private httpSvc: HttpClient) {
  }

  getUserData() {
    this.subscriptions.add(
      this.httpSvc.get(`${this.microsoftGraphUrl}/me`).subscribe(
        data => {
          this.userData = data;
        },
        error => {
          console.error(
            'Error while trying to get user data: ',
            JSON.stringify(error)
          );
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
