// Angular Import
import { Component,OnInit,ViewChild } from '@angular/core';
import { CommonModule,formatDate,DatePipe } from '@angular/common';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthenticationService } from '../../core/services/auth.service';
// import { BarChartComponent } from './bar-chart/bar-chart.component';
// import { BajajChartComponent } from './bajaj-chart/bajaj-chart.component';
// import { ChartDataMonthComponent } from './chart-data-month/chart-data-month.component';
import { DefaultService } from './default.service';

import { NgxSpinnerModule,NgxSpinnerService } from 'ngx-spinner';
// third party
import {
  NgApexchartsModule,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexAxisChartSeries,
  ApexXAxis,
  ApexYAxis,
  ApexTooltip,
  ApexPlotOptions,
  ApexResponsive
} from 'ng-apexcharts';

// export type ChartOptions = {
//   series: ApexAxisChartSeries;
//   chart: ApexChart;
//   dataLabels: ApexDataLabels;
//   plotOptions: ApexPlotOptions;
//   responsive: ApexResponsive[];
//   xaxis: ApexXAxis;
//   colors: string[];
//   yaxis: ApexYAxis;
//   tooltip: ApexTooltip;
// };
@Component({
  selector: 'app-default',
  standalone: true,
  imports: [CommonModule, SharedModule, NgApexchartsModule,NgxSpinnerModule],
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss'],
  providers: [DatePipe,NgxSpinnerService],  // Provide DatePipe here
})
export class DefaultComponent  implements OnInit{
  
  processedcount: number;
  extractedcount: number;
  nonextractedcount: number;
  formatteddateRange: string[];
  dateRange: string[];
  chartOptions:any;
  chartcattype:string ="";
  filter_startdate :string ="";
  filter_enddate :string ="";
  isdataloaded :boolean =false;
  
  
  // public props
  @ViewChild('chart') chart!: ChartComponent;
  // chartOptions!: Partial<ChartOptions>;

  constructor(
    private service: DefaultService,private spinner: NgxSpinnerService,private datePipe: DatePipe,private authService: AuthenticationService) {
    
  }
  ngOnInit() {
    this.spinner.show(); // Show the spinner before starting the AJAX call

    if(sessionStorage ==null || sessionStorage.length <=0){
      this.authService.logout();

    }else{
    this.chartcattype = "days";
    this.processedcount = 0;
    this.extractedcount = 0;
    this.nonextractedcount = 0;
    this.formatteddateRange = [];
    this.dateRange = [];
    
    // const fromDate = '2024-08-01';  // Example start date
    // const toDate = '2024-08-31';    // Example end date

    const currentDate = new Date();
    const endMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    console.log("currentDate:", currentDate);
    console.log("endMonth:", endMonth);
    this.filter_startdate = this.datePipe.transform(currentDate, 'yyyy-MM-dd');
    this.filter_enddate = this.datePipe.transform(endMonth, 'yyyy-MM-dd');

    this.formatteddateRange = this.getformattedDateRangeArray(this.filter_startdate, this.filter_enddate);
    this.dateRange = this.getDateRangeArray(this.filter_startdate, this.filter_enddate);

  this.chartOptions =  {
    series: [{
    name: 'Invoice Processed',
    data: []
  }, {
    name: 'Invoice Extracted',
    data: []
  }, {
    name: 'Invoice Not Extracted',
    data: []
  }],
    chart: {
    type: 'bar',
    height: 350
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%'
      // endingShape: 'rounded'
    },
  },
  dataLabels: {
    enabled: false
  },
  colors: ['#FFAF2F', '#009900', '#FF2F2F'], // Custom colors for each series
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent']
  },
  xaxis: {
    categories: this.formatteddateRange
  },
  yaxis: {
    title: {
      text: 'Count'
    }
  },
  fill: {
    opacity: 1
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return " " + val + " "
      }
    }
  },
title: {
  text: 'Invoice KPI', // Title text
  align: 'center', // Title alignment
  margin: 20, // Margin around the title
  offsetY: 0, // Offset from the top of the chart
  style: {
    fontSize: '16px', // Font size of the title
    fontWeight: 'bold', // Font weight of the title
    color: '#263238' // Color of the title
  }
},
  // legend: {
  //   position: 'bottom', // Position the legend on top
  //   horizontalAlign: 'center', // Center the legend horizontally
  //   floating: true, // Make the legend float on top
  //   offsetY: -10 // Adjust the vertical offset if needed
  // }
  };
    
    this.fetchMyCount();

    
    this.fetchchartdata();
  }
  
  
  }
  
  ngAfterViewInit() {
    
  }
  onItemchange(event: any) {
    this.filter_startdate = "";
    this.filter_enddate = "";
    const selectedOption = event.target.value;
    if(selectedOption == "-1"){
      this.chartcattype = "year";
      this.fetchchartdata();
    }else if(selectedOption == "lastyear"){
      this.chartcattype = "month";
      this.getLastYear()
    }else if(selectedOption == "thisyear"){
      this.chartcattype = "month";
      this.getCurrentYear()
    }else if(selectedOption == "lastmonth"){
      this.chartcattype = "days";
      this.getLastMonth()
    }else{
      this.chartcattype = "days";
      this.getCurrentMonth()
    }
    
  }

  getCurrentYear(): void {
    const currentDate = new Date();
    console.log("currentDate:", currentDate);
    const startYear = new Date(currentDate.getFullYear(), 0, 1);
    const endYear = new Date(currentDate.getFullYear(), 11, 31);
    // console.log("startYear:", startYear);
    
    this.filter_startdate = this.datePipe.transform(startYear, 'yyyy-MM-dd');
    this.filter_enddate = this.datePipe.transform(endYear, 'yyyy-MM-dd');
    // console.log("Start datePipe Date of the Current Year:", this.filter_startdate);

    // console.log("Start Date of the Current Year:", startYear.toISOString().split('T')[0]);
    // console.log("End Date of the Current Year:", endYear.toISOString().split('T')[0]);
    // this.filter_startdate = startYear.toISOString().split('T')[0] ;
    // this.filter_enddate = endYear.toISOString().split('T')[0] ;
    
    this.formatteddateRange = this.getFormattedMonthRangeArray(this.filter_startdate, this.filter_enddate);
    this.dateRange = this.getMonthRangeArray(this.filter_startdate, this.filter_enddate);
    this.chartOptions['xaxis'] = {categories: this.formatteddateRange};
    this.fetchchartdata();
  }

  getLastYear(): void {
    const currentDate = new Date();
    const startYear = new Date(currentDate.getFullYear()-1, 0, 1);
    const endYear = new Date(currentDate.getFullYear()-1, 11, 31);
    this.filter_startdate = this.datePipe.transform(startYear, 'yyyy-MM-dd');
    this.filter_enddate = this.datePipe.transform(endYear, 'yyyy-MM-dd');
    // console.log("Start Date of the Last Year:", startYear.toISOString().split('T')[0]);
    // console.log("End Date of the Last Year:", endYear.toISOString().split('T')[0]);
    // this.filter_startdate = startYear.toISOString().split('T')[0] ;
    // this.filter_enddate = endYear.toISOString().split('T')[0] ;

    
    this.formatteddateRange = this.getFormattedMonthRangeArray(this.filter_startdate, this.filter_enddate);
    this.dateRange = this.getMonthRangeArray(this.filter_startdate, this.filter_enddate);
    this.chartOptions['xaxis'] = {categories: this.formatteddateRange};
    this.fetchchartdata();
  }
  getLastMonth(): void {
    const currentDate = new Date();

    // Get the first day of the last month
    const startMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

    // Get the last day of the last month
    const endMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    this.filter_startdate = this.datePipe.transform(startMonth, 'yyyy-MM-dd');
    this.filter_enddate = this.datePipe.transform(endMonth, 'yyyy-MM-dd');
    // console.log("Start Date of the Current Month:", startMonth.toISOString().split('T')[0]);
    // console.log("End Date of the Current Month:", endMonth.toISOString().split('T')[0]);
    // this.filter_startdate = startMonth.toISOString().split('T')[0] ;
    // this.filter_enddate = endMonth.toISOString().split('T')[0] ;
    
    this.formatteddateRange = this.getformattedDateRangeArray(this.filter_startdate, this.filter_enddate);
    this.dateRange = this.getDateRangeArray(this.filter_startdate, this.filter_enddate);
    this.chartOptions['xaxis'] = {categories: this.formatteddateRange};
    this.fetchchartdata();
  }
  getCurrentMonth(): void {
    const currentDate = new Date();
    const startMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    this.filter_startdate = this.datePipe.transform(startMonth, 'yyyy-MM-dd');
    this.filter_enddate = this.datePipe.transform(endMonth, 'yyyy-MM-dd');
    // console.log("Start Date of the Current Month:", startMonth.toISOString().split('T')[0]);
    // console.log("End Date of the Current Month:", endMonth.toISOString().split('T')[0]);
    // this.filter_startdate = startMonth.toISOString().split('T')[0] ;
    // this.filter_enddate = endMonth.toISOString().split('T')[0] ;
    
    this.formatteddateRange = this.getformattedDateRangeArray(this.filter_startdate, this.filter_enddate);
    this.dateRange = this.getDateRangeArray(this.filter_startdate, this.filter_enddate);
    this.chartOptions['xaxis'] = {categories: this.formatteddateRange};

    this.fetchchartdata();
  }
  getformattedDateRangeArray(fromDate: string, toDate: string): string[] {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const dateArray: string[] = [];
  
    let currentDate = start;
  
    while (currentDate <= end) {
      // Format date as 'dd MMM'
      dateArray.push(formatDate(currentDate, 'dd MMM', 'en-US'));
  
      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    return dateArray;
  }
  getDateRangeArray(fromDate: string, toDate: string): string[] {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const dateArray: string[] = [];
  
    let currentDate = start;
  
    while (currentDate <= end) {
      // Format date as 'dd MMM'
      dateArray.push(formatDate(currentDate, 'YYYY-MM-dd', 'en-US'));
  
      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    return dateArray;
  }
  
getFormattedMonthRangeArray(fromDate: string, toDate: string): string[] {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const monthArray: string[] = [];

  // Ensure the end date is the last day of the month
  end.setMonth(end.getMonth() + 1);
  end.setDate(0);

  let currentDate = new Date(start);

  while (currentDate <= end) {
    // Format date as 'MMM yyyy' (e.g., 'Aug 2024')
    monthArray.push(formatDate(currentDate, 'MMM', 'en-US'));

    // Move to the next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return monthArray;
}

getMonthRangeArray(fromDate: string, toDate: string): string[] {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const monthArray: string[] = [];

  // Ensure the end date is the last day of the month
  end.setMonth(end.getMonth() + 1);
  end.setDate(0);

  let currentDate = new Date(start);

  while (currentDate <= end) {
    // Format date as 'MMM yyyy' (e.g., 'Aug 2024')
    monthArray.push(formatDate(currentDate, 'YYYY-MM', 'en-US'));

    // Move to the next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return monthArray;
}
  private fetchMyCount() {

    
    // this.spinner.show();
    this.service.getDahshoabrdcount().subscribe({
      next:async data=>{
        // this.spinner.hide();
        if(data !=null){
          
            // this.tokenService.fileuploadedcount = data['total-upload'] !=null ? data['total-upload']:0;
            // this.tokenService.deepfakefilecount = data['deepfake'] !=null ? data['deepfake']:0;
            this.processedcount = data['processed-count'] !=null ? data['processed-count']:0;
            this.extractedcount = data['extracted-count'] !=null ? data['extracted-count']:0;
            this.nonextractedcount = data['nonextracted-count'] !=null ? data['nonextracted-count']:0;
            // this.totalcompleted = data['completed'] !=null ? data['completed']:0;
            // this.totalfailed = data['failed'] !=null ? data['failed']:0;
            // this.pendingfile = this.totaluploaded - this.totalcompleted - this.totalfailed;
            // this.simplePieChart.series =[this.totalcompleted,this.totalfailed,this.pendingfile];
            // this.simplePieChart.labels =["Success","Fail","Pending"];
        }
      },error:  err=> {
        // this.spinner.hide();
        // this.authService.handleError(err);
      }
    })
  }
  private fetchchartdata() {

    
    var processedarr = [];
    var extractedarr = [];
    var nonextractedarr = [];
    console.log("dateRange ",this.dateRange);
    // this.spinner.show();
    this.service.fetchchartdata(this.filter_startdate,this.filter_enddate,this.chartcattype).subscribe({
      next:async dataobj=>{
        this.spinner.hide();
        if(dataobj !=null){
          this.dateRange.forEach(dateToCheck => {
            if (dataobj.hasOwnProperty(dateToCheck)) {
              processedarr.push(dataobj[dateToCheck]['processed-count']);
              extractedarr.push(dataobj[dateToCheck]['extracted-count']);
              nonextractedarr.push(dataobj[dateToCheck]['nonextracted-count']);
            } else {
              processedarr.push(0);
              extractedarr.push(0);
              nonextractedarr.push(0);
            }
          });
        }
        console.log("processedarr ",processedarr);
        this.chartOptions['series'] =  [{
          name: 'Invoice Processed',
          data: processedarr
        }, {
          name: 'Invoice Extracted',
          data: extractedarr
        }, {
          name: 'Invoice Not Extracted',
          data: nonextractedarr
        }];
        this.isdataloaded = true;
      },error:  err=> {
        this.isdataloaded = true;
        this.spinner.hide();
        // this.authService.handleError(err);
      }
    })
  }
}
