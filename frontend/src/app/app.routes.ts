import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '', loadComponent: () => import('./pages/landing-page/landing-page').then(m => m.LandingPage),
    },
    {
        path: 'registro', loadComponent: () => import('./pages/registro/registro').then(m => m.Registro),
    },
    
    {
        path: 'inicio-sesion', loadComponent: () => import('./pages/inicio-sesion/inicio-sesion').then(m => m.InicioSesion),
    },
    {
        path: 'forgot-password', loadComponent: () => import('./pages/forgot-password/forgot-password').then(m => m.ForgotPassword),
    },
    {
        path: 'private', loadComponent: () => import('./pages/private/layout/layout').then(m => m.Layout),
    },
];
