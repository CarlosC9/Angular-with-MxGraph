import { Component, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-http-error-page',
  templateUrl: './http-error-page.component.html',
  styleUrls: ['./http-error-page.component.scss']
})
export class HttpErrorPageComponent implements AfterViewInit {

  public header = "Error";
  public message = "Unexpected Error";

  constructor(
    private route: ActivatedRoute,
    private router: Router
    ) { }

  ngAfterViewInit() {
    this.route.queryParams.subscribe((params) => {
      if (params["header"] != undefined && params["message"] != undefined) {
        this.header = params["header"];
        this.message = params["message"];
      }
    });
  }

  onGoHomeButton() {
    this.router.navigateByUrl("login");
  }

}
