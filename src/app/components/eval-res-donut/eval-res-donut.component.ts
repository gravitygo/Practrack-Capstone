import { Component, Input, SimpleChanges } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-eval-res-donut',
  templateUrl: './eval-res-donut.component.html',
  styleUrls: ['./eval-res-donut.component.scss'],
})
export class EvalResDonutComponent {
  @Input() data: number[] = [];
  @Input() total: number = 0;

  public chart: any;
  private cLabels = ['Answered', 'Unanswered'];
  private cColors = ['rgb(16 185 129)', 'rgb(245 158 11)'];

  ngOnInit(): void {
    if (this.data) {
      this.createChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['data'] && changes['data'].currentValue) ||
      (changes['total'] && changes['total'].currentValue)
    ) {
      this.updateChart();
    }
  }

  private updateChart() {
    if (this.chart) {
      // Update the chart data if the chart instance exists
      this.chart.data.datasets[0].data = this.data;
      this.chart.options.plugins.title.text =
        this.total + ' in Post-Deployment';
      this.chart.update(); // Update the chart to reflect the changes
    } else {
      // If the chart instance doesn't exist, create it
      this.createChart();
    }
  }

  createChart() {
    const showLegend = this.total > 0 ? true : false; // Check if total is greater than 0

    this.chart = new Chart('evalResDonutChart', {
      type: 'doughnut',

      data: {
        labels: this.cLabels,
        datasets: [
          {
            label: 'Students',
            data: this.data,
            backgroundColor: this.cColors,
            hoverOffset: 4,
            borderWidth: 0,
          },
        ],
      },
      options: {
        aspectRatio: 1,
        plugins: {
          title: {
            display: true,
            text: this.total + ' in Post-Deployment',
            position: 'top',
            font: {
              size: 20,
            },
          },
          legend: {
            display: showLegend,
            position: 'bottom',
            labels: {
              font: {
                size: 13,
                style: 'normal',
              },
              generateLabels: (chart) => {
                const datasets = chart.data.datasets;
                return datasets[0].data.map((data, i) => ({
                  text: `${data} ${this.cLabels[i]} `,
                  fillStyle: this.cColors[i],
                  strokeStyle: this.cColors[i],
                  hidden: !chart.getDataVisibility(i),
                  index: i,
                }));
              },
            },
          },
        },
      },
    });
  }
}
