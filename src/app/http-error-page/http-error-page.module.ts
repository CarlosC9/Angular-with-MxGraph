import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorPageComponent } from './http-error-page.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [HttpErrorPageComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: HttpErrorPageComponent
      }
    ]),
  ]
})
export class HttpErrorPageModule { }
