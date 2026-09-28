import { Routes } from '@angular/router';

import { provideFavoriteTransferences } from './favorites.providers';

export const FAVORITES_ROUTES: Routes = [
  {
    path: 'new',
    providers: [provideFavoriteTransferences()],
    loadComponent: () =>
      import('./ui/favorite-transference-form/favorite-transference-form.component').then(
        (m) => m.FavoriteTransferenceFormComponent,
      ),
  },
];
