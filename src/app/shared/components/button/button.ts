import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NzButtonModule, NzButtonSize, NzButtonType } from 'ng-zorro-antd/button';

type NzButtonShape = 'circle' | 'round' | null;

@Component({
  selector: 'app-button',
  imports: [NzButtonModule],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {
  readonly type = input<NzButtonType>('default');
  readonly size = input<NzButtonSize>('default');
  readonly shape = input<NzButtonShape>(null);
  readonly ghost = input(false);
  readonly block = input(false);
  readonly loading = input(false);
  readonly disabled = input(false);
  readonly buttonLoadingText = input<string>('');

  readonly click = output<MouseEvent>();
}
