import { Component } from '@angular/core';

import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { en_US, NzI18nService, zh_CN } from 'ng-zorro-antd/i18n';

@Component({
  selector: 'app-datapicker',
  imports: [NzDatePickerModule],
  templateUrl: './datapicker.html',
  styleUrl: './datapicker.scss',
})
export class Datapicker {
  date = null;
  isEnglish = false;

  constructor(private i18n: NzI18nService) { }

  onChange(event: Event): void {
    console.log('onChange: ', event);
  }
}
