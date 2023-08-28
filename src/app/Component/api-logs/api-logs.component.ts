import { Component, OnInit } from '@angular/core';
import { ApiLog } from 'src/app/Models/Apilog.model';
import { LoginServiceService } from 'src/app/Services/login-service.service';

@Component({
  selector: 'app-api-logs',
  templateUrl: './api-logs.component.html',
  styleUrls: ['./api-logs.component.css']
})
export class ApiLogsComponent implements OnInit {
  logs: ApiLog[] = [];
  selectedTimeframe: string = 'last5'; // Default selected timeframe

  timeframeOptions = [
    { label: 'Last 5 mins', value: 'last5' },
    { label: 'Last 10 mins', value: 'last10' },
    { label: 'Last 30 mins', value: 'last30' },
    { label: 'Default', value: 'Default' },
  ];
  displayedColumns: string[] = ['id', 'ipAddress', 'requestBody', 'timestamp', 'email'];

  constructor(private logService: LoginServiceService) { }

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    if (this.selectedTimeframe === 'last5') {
      const startTime = new Date();
      startTime.setMinutes(startTime.getMinutes() - 5);
      this.getLogsByTimeRange(startTime);
    } else if (this.selectedTimeframe === 'last10') {
      const startTime = new Date();
      startTime.setMinutes(startTime.getMinutes() - 10);
      this.getLogsByTimeRange(startTime);
    } else if (this.selectedTimeframe === 'last30') {
      const startTime = new Date();
      startTime.setMinutes(startTime.getMinutes() - 30);
      this.getLogsByTimeRange(startTime);
    } else {
      this.logService.getApiLogs().subscribe((log) => {
        this.logs = log;
        // this.logs = this.logs.reverse();
      },
        (error) => {
          console.error('Error fetching API logs:', error);
        }
      )
    }
  }

  getLogsByTimeRange(startTime: Date, endTime?: Date): void {
    this.logService.getApiLogs().subscribe((logs) => {
      if (endTime) {
        this.logs = logs.filter((log) => new Date(log.timeStamp) >= startTime && new Date(log.timeStamp) <= endTime);
      } else {
        this.logs = logs.filter((log) => new Date(log.timeStamp) >= startTime);
      }
    });
  }
}

