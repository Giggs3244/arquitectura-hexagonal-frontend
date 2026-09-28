import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'transferences/favorites',
    loadChildren: () =>
      import('../modules/transferences/favorites/infrastructure/favorites.routes').then(
        (m) => m.FAVORITES_ROUTES,
      ),
  },
  { path: '', pathMatch: 'full', redirectTo: 'transferences/favorites/new' },
];
