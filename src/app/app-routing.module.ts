import { NgModule } from '@angular/core';
import { Routes, RouterModule} from '@angular/router';


const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./home/home.module').then( m => m.HomeModule) },
  { path: 'diagram-editor', loadChildren: () => import('./diagram-page/diagram-page.module').then( m => m.DiagramPageModule) },
  { path: 'diagram-editor/:id', loadChildren: () => import('./diagram-page/diagram-page.module').then( m => m.DiagramPageModule)},
  { path: 'login', loadChildren: () => import('./login-page/login-page.module').then( m => m.LoginPageModule) },
  { path: 'signup', loadChildren: () => import('./signup-page/signup-page.module').then( m => m.SignupPageModule) },
  { path: 'user-diagrams', loadChildren: () => import('./diagram-user-page/diagram-user-page.module').then( m => m.DiagramUserPageModule) },
  { path: 'http-error', loadChildren: () => import('./http-error-page/http-error-page.module').then( m => m.HttpErrorPageModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
