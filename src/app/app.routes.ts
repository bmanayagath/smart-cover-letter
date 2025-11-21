import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'auth/auth-callback',
    loadComponent: () => import('./components/auth-callback/auth-callback.component').then(m => m.AuthCallbackComponent)
  },
  {
    path: 'job-details',
    loadComponent: () => import('./components/job-form/job-form.component').then(m => m.JobFormComponent)
  },
  { path: '**', redirectTo: '' }
];