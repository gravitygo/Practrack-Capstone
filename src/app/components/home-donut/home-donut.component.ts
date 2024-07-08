import { Component, Input, SimpleChanges } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-home-donut',
  templateUrl: './home-donut.component.html',
  styleUrls: ['./home-donut.component.scss'],
})
export class HomeDonutComponent {
  @Input() data: any;

  public chart: any;
  private cLabels = [
    'Pre-Deployment',
    'Ongoing Deployment',
    'Post-Deployment',
    'Completed',
  ];
  private cColors = [
    'rgb(245 158 11)',
    'rgb(16 185 129)',
    'rgb(220 38 38)',
    'rgb(211 211 211)',
  ];

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
      this.chart.data.datasets[0].data = [
        this.data.total_pre,
        this.data.total_ongoing,
        this.data.total_post,
        this.data.total_completed,
      ];
      this.chart.options.plugins.legend.display =
        this.data.total > 0 ? true : false; // Check if total is greater than 0
      this.chart.update(); // Update the chart to reflect the changes
    } else {
      // If the chart instance doesn't exist, create it
      this.createChart();
    }
  }

  createChart() {
    const showLegend = this.data.total > 0 ? true : false; // Check if total is greater than 0

    this.chart = new Chart('studentsChart', {
      type: 'doughnut',

      data: {
        labels: this.cLabels,
        datasets: [
          {
            label: 'Students',
            data: [
              this.data.total_pre,
              this.data.total_ongoing,
              this.data.total_post,
              this.data.total_completed,
            ],
            backgroundColor: this.cColors,
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
            text: this.data.total + ' CT Students',
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
