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
];
