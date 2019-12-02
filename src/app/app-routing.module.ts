import { NgModule } from '@angular/core';
import { Routes, RouterModule} from '@angular/router';


const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./home/home.module').then( m => m.HomeModule) },
  { path: 'diagram', loadChildren: () => import('./diagram-page/diagram-page.module').then( m => m.DiagramPageModule) },
  { path: 'diagram/:id', loadChildren: () => import('./diagram-page/diagram-page.module').then( m => m.DiagramPageModule)},
  { path: 'login', loadChildren: () => import('./login-page/login-page.module').then( m => m.LoginPageModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
