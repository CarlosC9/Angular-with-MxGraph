import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagramUserPageComponent } from './diagram-user-page.component';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { DiagramsService } from '../services/diagrams.service';



@NgModule({
  declarations: [DiagramUserPageComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: DiagramUserPageComponent
      }
    ]),
    HttpClientModule
  ],
  providers: [DiagramsService],
})
export class DiagramUserPageModule { }
