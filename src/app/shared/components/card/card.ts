import { Component, ContentChild, ElementRef, TemplateRef, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
  selector: 'app-card-content-page',
  imports: [CommonModule, NzCardModule],
  templateUrl: './card.html',
  styleUrl: './card.scss',
})
export class Card {
  // public props
  /**
   * Title of card. It will be visible at left side of card header
   */
  cardTitle = input<string>();

  /**
   * Class to be applied at card level
   */
  cardClass = input<string>();

  /**
   * To hide content from card
   */
  showContent = input(true);

  /**
   * Class to be applied at card content.
   */
  blockClass = input<string>();

  /**
   * Class to be applied on card header
   */
  headerClass = input<string>();

  /**
   * To hide header from card
   */
  showHeader = input(true);

  /**
   * padding around card content. default in px
   */
  padding = input(20); // set default to 24 px

  /**
   * Template reference of header actions on custom header
   */
  @ContentChild('headerOptionsTemplate') headerOptionsTemplate!: TemplateRef<ElementRef>;

  /**
   * Template reference of header actions besides title at left
   */
  @ContentChild('headerTitleTemplate') headerTitleTemplate!: TemplateRef<ElementRef>;
}
