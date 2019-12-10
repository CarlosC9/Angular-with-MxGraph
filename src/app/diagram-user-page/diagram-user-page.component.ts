import { Component, AfterViewInit, Renderer, ElementRef } from '@angular/core';
import { DiagramsService } from '../services/diagrams.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-diagram-user-page',
  templateUrl: './diagram-user-page.component.html',
  styleUrls: ['./diagram-user-page.component.scss']
})
export class DiagramUserPageComponent implements AfterViewInit {

  private diagramsOwner;
  private diagramsCollaboration;

  constructor(
    private diagramsService: DiagramsService,
    private router: Router
  ) { }

  ngAfterViewInit() {

    let headerHeight = (<HTMLDivElement>document.getElementsByClassName("header")[0]).offsetHeight;
    document.getElementById("body-diagram-page").style.height = "calc(100% - " + headerHeight + "px)";

    this.requestDiagrams();
    this.eventsModal();

    document.getElementById("select-type-diagram").addEventListener("change", (evt) => {
      let value = (<HTMLSelectElement>evt.target).value;

      let listsDiagram = document.getElementsByClassName("list-diagrams");
      for (let i = 0; i < listsDiagram.length; i++) {
        let list = <HTMLElement>listsDiagram[i];
        list.style.display = "none";
      }

      let list = document.getElementById("list-" + value);

      if (list != null) {
        list.style.display = "block"
      }
    });

  }

  private requestDiagrams() {
    this.diagramsService.getUserDiagramOwner().subscribe(
      (data) => {
        document.getElementById("diagram-user-page").style.display = "block";
        this.diagramsOwner = data;
      },
      (errorResponse: HttpErrorResponse) => {
        if (errorResponse.status == 401) {
          this.router.navigateByUrl("login");
        }
      }
    );

    this.diagramsService.getUserDiagramsCollaboration().subscribe(
      (data) => {
        this.diagramsCollaboration = data;
      },
      (errorResponse: HttpErrorResponse) => {

      }
    )
  }

  private eventsModal() {
    
    var modal = document.getElementById("myModal");
    var span = document.getElementsByClassName("close")[0];
    
    span.addEventListener("click", () => {
      modal.style.display = "none";
    });

    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
    
    document.getElementById("form-modal").addEventListener("submit", (evt) => {
      evt.preventDefault();
      let form = <HTMLFormElement> evt.target;
      let name : string = form.nameDiagram.value;
      this.diagramsService.newDiagram(name).subscribe(
        (data) => {
          this.router.navigateByUrl("diagram-editor/" + data);
        }, (errorResponse) => {
          if (errorResponse.status == 401) {
            this.router.navigateByUrl("login");
          }
        }
      );
    })
  }

  onLogout() {
    localStorage.removeItem("access_token");
    this.router.navigateByUrl("login");
  }

  onDiagramSelect(evt: MouseEvent) {
    let id = (<HTMLElement>evt.target).getAttribute("data-id");
    this.router.navigateByUrl("diagram-editor/" + id);
  }

  onAddDiagram() {
    let modal = document.getElementById("myModal");
    modal.style.display = "block";
  }

}
