import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignupPageComponent } from './signup-page.component';
import { RouterModule } from '@angular/router';
import { UserService } from '../services/user.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [SignupPageComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule.forChild([
      {
        path: '',
        component: SignupPageComponent
      }
    ]),
  ],
  providers: [UserService],
})
export class SignupPageModule { }
