import { Component, AfterViewInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements AfterViewInit {

  private static readonly NOT_COMMUNICATING = 1;
  private static readonly COMMUNICATING = 2;

  private communicatingStatus = LoginPageComponent.NOT_COMMUNICATING;

  constructor(private userService: UserService, private router: Router) { }

  ngAfterViewInit() {

    let token = localStorage.getItem("access_token");
    if (token != null) {
      this.userService.profile().subscribe(
        () => {
          this.router.navigateByUrl("user-diagrams");
        },
        (error: HttpErrorResponse) => {
          if (error.status == 401) {
            localStorage.removeItem("access_token");
            document.getElementById("login-page").style.display = "block";
          }
        }
      )
    } else {
      document.getElementById("login-page").style.display = "block";
    }

    document.getElementById('form-login').addEventListener("submit", (evt) => {
      evt.preventDefault();
      if (this.communicatingStatus == LoginPageComponent.NOT_COMMUNICATING) {
        this.communicatingStatus = LoginPageComponent.COMMUNICATING;
        var formLogin: HTMLFormElement = <HTMLFormElement>evt.target;
        var user = {
          username: formLogin.username.value,
          password: formLogin.password.value,
        }
        this.userService.login(user).subscribe(
          (data: { access_token: string }) => {
            localStorage.setItem("access_token", data.access_token);
            this.router.navigateByUrl("user-diagrams");
          },
          (errorResponse: HttpErrorResponse) => {
            if (errorResponse.status == 401) {
              this.communicatingStatus = LoginPageComponent.NOT_COMMUNICATING;
              let errorElement = document.getElementById("error-message-auth");
              errorElement.innerText = "Username or password incorrect";
              errorElement.style.display = 'block';
            }
          });
      }
    });
  }



}
