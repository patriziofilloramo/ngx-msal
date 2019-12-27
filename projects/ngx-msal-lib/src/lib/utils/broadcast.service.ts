import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
export type MessageCallback = (payload: any) => void;

@Injectable(
    { providedIn: 'root'}
)
export class BroadcastService {
    private _msalSubject : BehaviorSubject<any> ;
    private _msalItem$:  Observable<any>;

    constructor()
    {
     this._msalSubject = new BehaviorSubject<any>(1);
     this._msalItem$  = this._msalSubject.asObservable();
    }

    broadcast(type: string ,payload: any) {
        this._msalSubject.next({type , payload});
    }

    getMSALSubject()
    {
        return this._msalSubject;
    }

    get_msalItem()
    {
        return this._msalItem$;
    }

    subscribe(type: string, callback: MessageCallback): Subscription {
        return this._msalItem$.pipe(
            filter(message => message.type === type),
            map(message => message.payload)
        ).subscribe(callback);
    }

}
