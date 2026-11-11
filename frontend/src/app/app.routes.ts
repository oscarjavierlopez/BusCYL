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
        path: 'reset-password', loadComponent: () => import('./pages/reset-password/reset-password').then(m => m.ResetPassword),
    },
    {
        path: 'private',
        loadComponent: () => import('./pages/private/layout/layout').then(m => m.Layout),
        children: [
            {
                path: 'usuarios', loadComponent: () => import('./pages/private/administrador/usuarios/usuarios').then(m => m.Usuarios),
            },
            {
                path: 'usuarios/crear', loadComponent: () => import('./pages/private/administrador/crear-usuario/crear-usuario').then(m => m.CrearUsuario),
            },
            {
                path: 'usuarios/editar/:id', loadComponent: () => import('./pages/private/administrador/editar-usuario/editar-usuario').then(m => m.EditarUsuario),
            },
            {
                path: 'empresas', loadComponent: () => import('./pages/private/administrador/empresas/empresas').then(m => m.Empresas),
            },
            {
                path: 'empresas/crear', loadComponent: () => import('./pages/private/administrador/crear-empresa/crear-empresa').then(m => m.CrearEmpresa),
            },
        ],
    },
];
