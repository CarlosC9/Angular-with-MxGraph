import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoginPageComponent } from './login-page.component';
import { UserService } from '../services/user.service';
import { HttpClientModule } from '@angular/common/http';



@NgModule({
  declarations: [LoginPageComponent],
  imports: [
    HttpClientModule,
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: LoginPageComponent
      }
    ]),
  ],
  providers: [UserService],
})
export class LoginPageModule { }
