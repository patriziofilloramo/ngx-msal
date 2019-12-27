import { Component, OnInit } from '@angular/core';
import { AppService } from '../../app.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {

  constructor(public appSvc: AppService) { }

  ngOnInit() {
    this.appSvc.getUserData();
  }

}
