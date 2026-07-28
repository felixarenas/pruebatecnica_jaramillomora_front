import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { LoadingService } from '../../../services/loading';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.html',
  styleUrl: './loading.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Loading {
  private readonly loadingService = inject(LoadingService);

  readonly isLoading = this.loadingService.isLoading;

  readonly isCargaCompleta = this.loadingService.isCargaCompleta;

  readonly isCargaCompletaString = this.loadingService.isCargaCompletaString;

  readonly isCargaMensaje = this.loadingService.isCargaMensaje;
}
