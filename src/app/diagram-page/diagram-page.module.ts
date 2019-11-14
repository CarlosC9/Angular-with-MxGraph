import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DiagramPageComponent } from './diagram-page.component';
import { DiagramEditorComponent } from '../diagram-editor/diagram-editor.component';



@NgModule({
  declarations: [DiagramPageComponent,DiagramEditorComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: DiagramPageComponent
      }
    ])
  ]
})
export class DiagramPageModule { }
