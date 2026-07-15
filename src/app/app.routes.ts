import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: 'login', loadComponent: () => import('./pages/auth/login/login').then((m) => m.Login), title: 'Login' },
    { path: '', loadComponent: () => import('./pages/auth/login/login').then(m => m.Login), title: 'Login' },
    {
        path: '',
        loadComponent: () => import('./shared/components/layout/layout').then(m => m.Layout),
        title: 'Main',
        children: [
            { path: 'home', loadComponent: () => import('./pages/main/home/home').then(m => m.Home), title: 'Home' },
            {
                path: 'clientes',
                loadComponent: () => import('./pages/clientes/principal/principal').then(m => m.Principal),
                title: 'Clientes',
            },
            {
                path: 'servicios',
                loadComponent: () => import('./pages/servicios/principal/principal').then(m => m.Principal),
                title: 'Servicios',
            },
            {
                path: 'cliente-servicios',
                loadComponent: () => import('./pages/servicios/cliente-servicios/principal/principal').then(m => m.Principal),
                title: 'Consultar Servicios de Clientes',
            },

            {
                path: 'cargue-ifc',
                loadComponent: () => import('./pages/cargue-ifc/cargue-ifc').then(m => m.CargueIfc),
                title: 'Cargue IFC',
            },
        ]
    },
    { path: '**', loadComponent: () => import('./shared/pages/notfound/notfound').then(m => m.Notfound), title: 'Not Found' },
];
