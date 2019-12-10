import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {

  constructor(private router : Router) { }

  ngAfterViewInit() {

  }

  onStartButton() {
    this.router.navigateByUrl("login");
  }

}
