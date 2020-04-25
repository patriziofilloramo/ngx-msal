import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
export type MessageCallback = (payload: any) => void;

@Injectable({ providedIn: 'root' })
export class BroadcastService {
  private msalSubject: BehaviorSubject<any>;
  private msalItem$: Observable<any>;

  constructor() {
    this.msalSubject = new BehaviorSubject<any>(1);
    this.msalItem$ = this.msalSubject.asObservable();
  }

  broadcast(type: string, payload: any) {
    this.msalSubject.next({ type, payload });
  }

  getMSALSubject() {
    return this.msalSubject;
  }

  getmsalItem() {
    return this.msalItem$;
  }

  subscribe(type: string, callback: MessageCallback): Subscription {
    return this.msalItem$
      .pipe(
        filter((message) => message.type === type),
        map((message) => message.payload)
      )
      .subscribe(callback);
  }
}
