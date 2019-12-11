import { Component, AfterViewInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-configuration-page',
  templateUrl: './user-configuration-page.component.html',
  styleUrls: ['./user-configuration-page.component.scss']
})
export class UserConfigurationPageComponent implements AfterViewInit {

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
  ) { }

  ngAfterViewInit() {
    this.userService.getConfiguration().subscribe(
      (data : any) => {
        console.log(data);
        var inputs = document.getElementsByTagName('input');

        for (var i = 0; i < inputs.length; i++) {
          if (inputs[i].type.toLowerCase() == 'radio')  {
            if (inputs[i].value == data.colorParentType) {
              inputs[i].checked = true;
            } else if (inputs[i].value == data.colorScaleChange) {
              inputs[i].checked = true;
            }
          }
        }
        document.getElementById("user-configuration-page").style.display = "block";
      },
      (errorResponse: HttpErrorResponse) => {
        switch (errorResponse.status) {
          case 401:
            this.router.navigate(["http-error"], {
              queryParams: {
                header: "Error 401 (UNAUTHORIZED)",
                message: "Not logged in",
              }
            });
        }
      });
  }

  onBack() {
    this.router.navigateByUrl("user-diagrams");
  }

  onLogout() {
    localStorage.removeItem("access_token");
    this.router.navigateByUrl("login");
  }

  onConfigurationChange(evt: Event) {
    evt.preventDefault();
    let form = <HTMLFormElement>evt.target;
    let colorParentType = form.colorParentType.value;
    let colorScaleChange = form.colorScaleChange.value;
    this.userService.updateConfiguration(colorParentType,colorScaleChange).subscribe(
      (data) => {
        let successfulMessage = <HTMLDivElement> document.getElementById("successful-message-configurate");
        successfulMessage.innerHTML = "The changes have been saved";
        successfulMessage.style.display = "block";
        setTimeout(() => {
          successfulMessage.style.display = "none";
        }, 2000);
      },
      (errorResponse : HttpErrorResponse) => {
        switch(errorResponse.status) {
          case 401:
              this.router.navigate(["http-error"], {
                queryParams: {
                  header: "Error 401 (UNAUTHORIZED)",
                  message: "You are not authorized to make changes",
                }
              });
        }
      }
    )
  }

}
