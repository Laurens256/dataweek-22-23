import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'yearTracksAmount'
})
export class YearTracksAmountPipe implements PipeTransform {

  transform(dates: {year:number, month: number, day: number}[], selectedYear: number): number {
    let amount = 0;
    for(let i=0; i<dates.length; i++) {
      if(dates[i].year === selectedYear) {
        amount++;
      }
    }
    return amount;
  }

}
