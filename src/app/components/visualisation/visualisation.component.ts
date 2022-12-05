import { Component, OnInit, Input, OnChanges, SimpleChanges, AfterViewInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

import { TooltipService } from 'src/app/core/services/tooltip.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-visualisation',
  templateUrl: './visualisation.component.html',
  styleUrls: ['./visualisation.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VisualisationComponent implements OnInit {

  constructor(

    private tooltipSvc: TooltipService,
  ) { }
    ngOnInit(): void {

    }
}
