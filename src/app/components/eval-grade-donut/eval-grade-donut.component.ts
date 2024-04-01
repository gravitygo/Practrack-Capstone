import {
  Component,
  Input,
  SimpleChanges,
  ElementRef,
  ViewChild,
} from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-eval-grade-donut',
  templateUrl: './eval-grade-donut.component.html',
  styleUrls: ['./eval-grade-donut.component.scss'],
})
export class EvalGradeDonutComponent {
  @Input() data: number[] = [];
  @ViewChild('evalGradeDonutCanvas', { static: true })
  evalGradeDonutCanvas!: ElementRef;

  public chart: any;
  private cColors = [
    'rgba(0, 0, 0, 0)', // transparent
    'rgb(16 185 129)', // green
    'rgb(245 158 11)', // orange
    'rgb(220 38 38)', // red
  ];
  private cColorsUsed = [this.cColors[3], this.cColors[0]]; // default = red

  ngOnInit(): void {
    if (this.data) {
      this.createChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      this.updateChart();
    }
  }

  private updateChart() {
    if (this.chart) {
      this.chart.destroy(); // Destroy existing chart before creating a new one
    }
    this.createChart();
  }

  createChart() {
    // Change chart color depending on value
    if (this.data[0] >= 90) {
      this.cColorsUsed[0] = this.cColors[1];
    } else if (this.data[0] < 90 && this.data[0] >= 70) {
      this.cColorsUsed[0] = this.cColors[2];
    } // else: value < 70 = keep default

    // Set title depending on data
    const title = this.data && this.data[0] ? this.data[0] + '%' : '';

    this.chart = new Chart(this.evalGradeDonutCanvas.nativeElement, {
      type: 'doughnut',

      data: {
        datasets: [
          {
            data: this.data,
            backgroundColor: this.cColorsUsed,
            hoverOffset: 4,
            borderWidth: 0,
          },
        ],
      },
      options: {
        aspectRatio: 1.1,
        plugins: {
          title: {
            display: true,
            text: title,
            position: 'bottom',
            padding: {
              top: 20,
            },
            color: this.cColorsUsed[0],
            font: {
              size: 24,
            },
          },
        },
      },
    });
  }
}
