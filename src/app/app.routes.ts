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
                path: 'cargue-ifc',
                loadComponent: () => import('./pages/cargue-ifc/cargue-ifc').then(m => m.CargueIfc),
                title: 'Cargue IFC',
            },
            {
                path: 'show-model3d',
                loadComponent: () => import('./pages/show-model3d/show-model3d').then(m => m.ShowModel3d),
                title: 'Modelos IFC',
            },
            {
                path: 'process-grafic-ifc',
                loadComponent: () => import('./pages/process-grafic-ifc/process-grafic-ifc').then(m => m.ProcessGraficIfc),
                title: 'Graficación de Elementos IFC',
            },
        ]
    },
    { path: '**', loadComponent: () => import('./shared/pages/notfound/notfound').then(m => m.Notfound), title: 'Not Found' },
];
