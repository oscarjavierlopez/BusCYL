import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '', loadComponent: () => import('./pages/landing-page/landing-page').then(m => m.LandingPage),
    },
    {
        path: 'registro', loadComponent: () => import('./pages/registro/registro').then(m => m.Registro),
    }
];
