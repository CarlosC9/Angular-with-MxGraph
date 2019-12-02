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

  constructor(private userService : UserService, private router : Router) { }

  ngAfterViewInit() {
    
    let token = localStorage.getItem("access_token");
    if (token != null) {
      this.userService.profile().subscribe(
        () => {
          this.router.navigateByUrl("diagram");
        },
        (error : HttpErrorResponse) => {
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
      var formLogin : HTMLFormElement = <HTMLFormElement> evt.target;
      var user =  {
        username: formLogin.username.value,
        password: formLogin.password.value,
      }
      this.userService.login(user).subscribe( 
      (data : { access_token : string }) => {
        console.log("hola");
        localStorage.setItem("access_token", data.access_token);
        this.router.navigateByUrl("diagram");
      },
      (error) => {
        if (error.status == 401) {
          
        }
      });
    });
  }



}
