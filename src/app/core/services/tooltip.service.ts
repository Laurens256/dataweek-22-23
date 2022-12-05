import { Injectable } from '@angular/core';
import { formatNumber } from '@angular/common'

@Injectable()
export class TooltipService {
  constructor() { }

  doTooltip(e: MouseEvent) {
    let data;
    const tooltip: HTMLDivElement = document.querySelector('.tooltip')!;

    const tooltipData: HTMLElement = (e.target as HTMLElement).closest('*[data-tooltip]')!;

    if (tooltipData) {
      data = tooltipData.dataset['tooltip'];

      const mainElement = document.querySelector('main')!.getBoundingClientRect();
      const x = e.clientX - mainElement.left;
      const y = e.clientY - mainElement.top;
      const tooltipText: HTMLParagraphElement = tooltip.querySelector('p')!;

      if (tooltip && tooltipText) {
        tooltip.classList.add('visible');
        tooltip.style.left = `${x + 15}px`;
        tooltip.style.top = `${y + 15}px`;

        const roundedNumber = parseFloat(data!.split(' ')[1]).toFixed(2);
        tooltipText.textContent = `${data!.split(' ')[0]} ${roundedNumber}%`;
      }
    } else {
      tooltip.classList.remove('visible');
    }
  }
}
