import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DiagramPageComponent } from './diagram-page.component';
import { DiagramEditorComponent } from '../diagram-editor/diagram-editor.component';
import { DiagramsService } from '../services/diagrams.service';
import { HttpClientModule } from '@angular/common/http';



@NgModule({
  declarations: [DiagramPageComponent,DiagramEditorComponent],
  imports: [
    HttpClientModule,
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: DiagramPageComponent
      }
    ])
  ],
  providers : [DiagramsService],
})
export class DiagramPageModule { }
