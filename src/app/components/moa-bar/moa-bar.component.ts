import { Component, Input, SimpleChanges } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-moa-bar',
  templateUrl: './moa-bar.component.html',
  styleUrls: ['./moa-bar.component.scss'],
})
export class MoaBarComponent {
  @Input() data: number[][] = [];
  // 0: relevance (0: yes, 1: no)
  // 1: scope of work (0: yes, 1: no)
  // 2: career dev (0: yes, 1: no)

  public chart: any;
  private criteria = ['Relevance', 'Scope of Work', 'Career Development'];
  private options = ['Yes', 'No'];

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
      // Update the chart data if the chart instance exists
      this.chart.data.datasets[0].data = this.data;
      this.chart.update(); // Update the chart to reflect the changes
    } else {
      // If the chart instance doesn't exist, create it
      this.createChart();
    }
  }

  createChart() {
    this.chart = new Chart('moaBarChart', {
      type: 'bar',
      data: {
        labels: this.options,
        datasets: [
          {
            label: this.criteria[0],
            data: this.data[0],
          },
          {
            label: this.criteria[1],
            data: this.data[1],
          },
          {
            label: this.criteria[2],
            data: this.data[2],
          },
        ],
      },
      options: {
        aspectRatio: 1.8,
        plugins: {
          title: {
            display: true,
            text: 'Weighted Attributes',
          },
        },
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
          },
        },
      },
    });
  }
}
