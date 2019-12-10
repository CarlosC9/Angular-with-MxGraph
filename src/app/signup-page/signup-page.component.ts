import { Component, AfterViewInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.scss']
})
export class SignupPageComponent implements AfterViewInit {

  private static readonly NOT_COMMUNICATING = 1;
  private static readonly COMMUNICATING = 2;

  private communicatingStatus = SignupPageComponent.NOT_COMMUNICATING;

  constructor(private userService: UserService, private router: Router) { }

  ngAfterViewInit() {
    let token = localStorage.getItem("access_token");
    if (token != null) {
      this.userService.profile().subscribe(
        () => {
          this.router.navigateByUrl("login");
        },
        (error: HttpErrorResponse) => {
          if (error.status == 401) {
            localStorage.removeItem("access_token");
            document.getElementById("signup-page").style.display = "block";
          }
        }
      )
    } else {
      document.getElementById("signup-page").style.display = "block";
    }

    document.getElementById('form-signup').addEventListener("submit", (evt) => {
      evt.preventDefault();
      if (this.communicatingStatus == SignupPageComponent.NOT_COMMUNICATING) {
        this.communicatingStatus = SignupPageComponent.COMMUNICATING;
        let formLogin: HTMLFormElement = <HTMLFormElement>evt.target;

        let user = {
          username: formLogin.username.value,
          password: formLogin.password.value,
        }

        this.userService.signup(user).subscribe(
          () => {
            this.userService.login(user).subscribe(
              (data: { access_token: string }) => {
                localStorage.setItem("access_token", data.access_token);
                this.router.navigateByUrl("user-diagrams");
              },
              (error) => {
                if (error.status == 401) {

                }
              });
          },
          (errorResponse: HttpErrorResponse) => {
            if (errorResponse.status == 400) {
              this.communicatingStatus = SignupPageComponent.NOT_COMMUNICATING;
              let errorElement = document.getElementById("error-message-auth");
              errorElement.innerText = errorResponse.error.message;
              errorElement.style.display = 'block';
            }
          }
        )
      }
    });
  }

}
