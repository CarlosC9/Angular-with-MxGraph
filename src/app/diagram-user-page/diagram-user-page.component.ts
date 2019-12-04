import { Component, AfterViewInit } from '@angular/core';
import { DiagramsService } from '../services/diagrams.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-diagram-user-page',
  templateUrl: './diagram-user-page.component.html',
  styleUrls: ['./diagram-user-page.component.scss']
})
export class DiagramUserPageComponent implements AfterViewInit {

  constructor(
    private diagramsService : DiagramsService,
    private router : Router,
  ) { }

  ngAfterViewInit() {

    let headerHeight = (<HTMLDivElement>document.getElementsByClassName("header")[0]).offsetHeight;
    document.getElementById("body-diagram-page").style.height = "calc(100% - " + headerHeight + "px)";

    this.diagramsService.getUserDiagram().subscribe(
      (data) => {
        console.log(data);
      },
      (errorResponse : HttpErrorResponse) => {
        if (errorResponse.status == 401) {
          this.router.navigateByUrl("login");
        }
      }
      )
  }


  onLogout() {
    localStorage.removeItem("access_token");
    this.router.navigateByUrl("login");
  }

}
