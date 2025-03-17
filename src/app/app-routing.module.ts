import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';
import { DetailsComponent } from './demo/invoice-list/details/details.component';


const routes: Routes = [
  {
    path: '',
    component: GuestComponent,
    children: [
      {
        path: '',
        redirectTo: '/guest/login',
        pathMatch: 'full'
      },
      {
        path: 'guest',
        loadChildren: () => import('./demo/pages/authentication/authentication.module').then((m) => m.AuthenticationModule)
      }
    ]
  },
  {
    path: '',
    component: AdminComponent,
    children: [
      // {
      //   path: '',
      //   redirectTo: '/default',
      //   pathMatch: 'full'
      // },
      {
        path: 'default',
        loadComponent: () => import('./demo/default/default.component').then((c) => c.DefaultComponent)
      },
      {
        path: 'invoice-list',
        loadComponent: () => import('./demo/invoice-list/invoice-list.component').then((c) => c.InvoiceListComponent)
      },
      {
        path: 'invoice-list/details',
        loadComponent: () => import('./demo/invoice-list/details/details.component').then((c) => c.DetailsComponent)
      },
      {
        path: 'typography',
        loadComponent: () => import('./demo/elements/typography/typography.component')
      },
      {
        path: 'color',
        loadComponent: () => import('./demo/elements/element-color/element-color.component')
      },
      {
        path: 'sample-page',
        loadComponent: () => import('./demo/sample-page/sample-page.component')
      },
      {
        path: 'Report',
        loadComponent: () => import('./demo/admin-panel/admin-panel.component').then((c)=> c.AdminPanelComponent)
      },
      {
        path: 'upload-invoice',
        loadComponent: () => import('./demo/invoice-list/invoice-list.component').then((c)=> c.InvoiceListComponent)
      },
      {
        path: 'user-register',
        loadComponent: () => import('./demo/user-register/user-register.component').then(c => c.UserRegisterComponent)
      },
      {
        path: 'details',
        loadComponent: () => import('./demo/invoice-list/details/details.component').then(c => c.DetailsComponent)
      },
        

    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
