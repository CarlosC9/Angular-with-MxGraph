import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserConfigurationPageComponent } from './user-configuration-page.component';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { UserService } from '../services/user.service';



@NgModule({
  declarations: [UserConfigurationPageComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: UserConfigurationPageComponent,
      }
    ]),
    HttpClientModule,
  ],
  providers: [UserService],
})
export class UserConfigurationPageModule { }
