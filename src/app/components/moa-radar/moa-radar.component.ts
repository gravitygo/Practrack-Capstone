import { Component, Input, SimpleChanges } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-moa-radar',
  templateUrl: './moa-radar.component.html',
  styleUrls: ['./moa-radar.component.scss'],
})
export class MoaRadarComponent {
  @Input() data: number[][] = [];
  // 0: yes (0: rel, 1: scope, 2: dev)
  // 1: no (0: rel, 1: scope, 2: dev)

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
    this.chart = new Chart('moaRadarChart', {
      type: 'radar',
      data: {
        labels: this.criteria,
        datasets: [
          {
            label: this.options[0],
            data: this.data[0],
          },
          {
            label: this.options[1],
            data: this.data[1],
          },
        ],
      },
      options: {
        aspectRatio: 1.5,
        plugins: {
          title: {
            display: true,
            text: 'Attributes',
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    });
  }
}
