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
            {
                path: 'empresas/editar/:id', loadComponent: () => import('./pages/private/administrador/editar-empresa/editar-empresa').then(m => m.EditarEmpresa),
            },
            {
                path: 'autobuses', loadComponent: () => import('./pages/private/coordinador-empresa/autobuses/autobuses').then(m => m.Autobuses),
            },
            {
                path: 'autobuses/crear', loadComponent: () => import('./pages/private/coordinador-empresa/crear-autobus/crear-autobus').then(m => m.CrearAutobus),
            },
            {
                path: 'autobuses/editar/:id', loadComponent: () => import('./pages/private/coordinador-empresa/editar-autobus/editar-autobus').then(m => m.EditarAutobus),
            },
            {
                path: 'viajes/coordinador', loadComponent: () => import('./pages/private/coordinador-empresa/viajes-coordinador/viajes-coordinador').then(m => m.ViajesCoordinador),
            },
            {
                path: 'viajes/coordinador/crear', loadComponent: () => import('./pages/private/coordinador-empresa/crear-viaje/crear-viaje').then(m => m.CrearViaje),
            },
            {
                path: 'viajes/coordinador/editar/:id', loadComponent: () => import('./pages/private/coordinador-empresa/editar-viaje/editar-viaje').then(m => m.EditarViaje),
            },
            {
                path: 'viajes/pasajero/buscar', loadComponent: () => import('./pages/private/pasajero/buscar-viajes/buscar-viajes').then(m => m.BuscarViajes),
            },
            {
                path: 'misViajes', loadComponent: () => import('./pages/private/pasajero/mis-viajes/mis-viajes').then(m => m.MisViajes),
            },
            {
                path: 'viaje/:id', loadComponent: () => import('./pages/private/pasajero/viaje/viaje').then(m => m.Viaje),
            },
            {
                path: 'viaje/reservar/:id', loadComponent: () => import('./pages/private/pasajero/reservar-viaje/reservar-viaje').then(m => m.ReservarViaje),
            },
        ],
    },
];
