import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';

import { Auth } from '../../../services/auth';
import { Loading } from '../loading/loading';

@Component({
  selector: 'app-layout',
  imports: [
    CommonModule,
    RouterModule,
    NzBreadCrumbModule,
    NzDropDownModule,
    NzIconModule,
    NzLayoutModule,
    NzMenuModule,
    Loading,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  isCollapsed = false;
  protected readonly date = new Date();
  readonly authUser = signal(this.auth.getAuthUser());
  readonly accessToken = signal(this.auth.getAccessToken());

  logout(): void {
    this.auth.logout();
    this.authUser.set(null);
    this.accessToken.set(null);
    this.router.navigate(['/login']);
  }
}
