import { Component, Input, SimpleChanges } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-eval-line',
  templateUrl: './eval-line.component.html',
  styleUrls: ['./eval-line.component.scss'],
})
export class EvalLineComponent {
  @Input() data: number[] = [];
  @Input() labels: string[] = [];

  public chart: any;

  ngOnInit(): void {
    if (this.data) {
      this.createChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['data'] && changes['data'].currentValue) ||
      (changes['labels'] && changes['labels'].currentValue)
    ) {
      this.updateChart();
    }
  }

  private updateChart() {
    if (this.chart) {
      // Update the chart data if the chart instance exists
      this.chart.data.datasets[0].data = this.data;
      this.chart.data.labels = this.labels;
      this.chart.update(); // Update the chart to reflect the changes
    } else {
      // If the chart instance doesn't exist, create it
      this.createChart();
    }
  }

  createChart() {
    this.chart = new Chart('evalLineChart', {
      type: 'line',

      data: {
        labels: this.labels, // x axis
        datasets: [
          {
            label: 'Evaluations',
            data: this.data, // y axis
          },
        ],
      },
      options: {
        aspectRatio: 2,
        plugins: {
          title: {
            display: true,
            text: '(Chart displays data from the last 9 terms only)',
            position: 'bottom',
            font: {
              size: 13,
              style: 'italic',
            },
          },
          legend: {
            display: true,
          },
        },
        scales: {
          y: {
            ticks: {
              precision: 0,
            },
          },
        },
      },
    });
  }
}
