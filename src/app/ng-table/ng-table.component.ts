import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { breakpointsProvider, BreakpointsService, BreakpointEvent } from '../services/breakpoints.service';
import { PagerService } from '../services/pager.service';
import { RoundProgressModule, RoundProgressConfig } from 'angular-svg-round-progressbar';

declare var moment:any;

@Component({
  selector: 'ng-table',
  templateUrl: './ng-table.component.html',
  styleUrls: ['./ng-table.component.css'],
  providers: [breakpointsProvider(), PagerService]
})
export class NgTableComponent implements OnInit {
  @Input() headers:any;
  @Input() data:any;
  @Input() needCheckBox:boolean;
  @Input() pageSize:number;
  @Input() pageSizeChart:any;
  @Input() dataPaging:boolean;
  @Input() updateCheckboxForARecord:any;
  @Output() update = new EventEmitter<any>();
  @Output() selectedRow = new EventEmitter<any>();

  isExpandable:boolean = false;
  viewPort:string = '';
  internalHeaders:any;
  internalData:any;
  internalDataWithoutFilter:any;
  internalNeedCheckBox:boolean;
  internalPageSize:number;
  internalPageSizeChart:any;
  internalDataPaging:boolean = false;

  rowExpandIndex:number = -1;
  colFilterIndex:number = -1;
  column:string = '';
  isDesc:boolean = false;

  // pager object
  pager: any = {};

  // paged items
  pagedItems: any[];

  constructor(private breakpointsService: BreakpointsService, private pagerService: PagerService,private _config: RoundProgressConfig) { 
    this.breakpointsService.changes.subscribe((event: BreakpointEvent) => {            
            console.log(event);
            this.viewPort = event.name;
            this.isExpandable = this.Expandable();
            this.setPage(1);
        });
    _config.setDefaults({
        color: '#f00',
        background: '#0f0'
    });
  }

  ngOnChanges(changes:any):void {
    let setPageRequired:boolean = false;
    if (changes!=undefined && changes.dataPaging!=undefined && changes.dataPaging.currentValue) {
      this.internalDataPaging = changes.dataPaging.currentValue;
    }
    if (changes!=undefined && changes.needCheckBox!=undefined && changes.needCheckBox.currentValue) {
      this.internalNeedCheckBox = changes.needCheckBox.currentValue;
    }
    
    if (changes!=undefined && changes.headers!=undefined && changes.headers.currentValue) {
      this.internalHeaders = changes.headers.currentValue;
      console.log('Header changed');
      this.isExpandable = this.Expandable();
    }
    if (changes!=undefined && changes.data!=undefined && changes.data.currentValue) {
      let data = changes.data.currentValue;
      let i:number = 1;
      for (let v of data)
      {
          v.globalRowIndex = i;
          i = i+1;
      }
      this.internalData = data;
      this.pagedItems = data;
      this.internalDataWithoutFilter = data;
      setPageRequired = true;
      this.update.emit({
          totalRows: this.internalData.length
      });
    }
    if (changes!=undefined && changes.internalData!=undefined && changes.internalData.currentValue) {
      this.update.emit({
          totalRows: this.internalData.length
      });
    }
    if (changes!=undefined && changes.pageSize!=undefined && changes.pageSize.currentValue) {
      this.internalPageSize = changes.pageSize.currentValue;
      setPageRequired = true;
    }
    if (changes!=undefined && changes.pageSizeChart!=undefined && changes.pageSizeChart.currentValue) {
      this.internalPageSizeChart = changes.pageSizeChart.currentValue;
      setPageRequired = true;
    }
    if (changes!=undefined && changes.updateCheckboxForARecord!=undefined && changes.updateCheckboxForARecord.currentValue) {
      let record:any = changes.updateCheckboxForARecord.currentValue;
      if(record!=undefined && record!=null && record.property!=undefined && record.property!=null){
        let i: number = this.internalDataWithoutFilter.findIndex(x => x[record.property] == record.propertyValue);
        if(i>-1)
        {
          this.internalDataWithoutFilter[i].IsChecked = record.IsChecked;
        }        
      }
    }
    if(setPageRequired)
    {
      this.setPage(1);
    }
  }

  ngOnInit() {
    this.isExpandable = this.Expandable();
    //this.pagedItems = this.internalData;
  }

  getPageSize(){
    if(this.internalPageSizeChart==undefined || this.internalPageSizeChart==null)
      return this.internalPageSize;

    let size:number = this.internalPageSizeChart[this.viewPort];
    if(size==undefined || size == null)
      return this.internalPageSize;
    
    return size;
  }

  ShowExpand(index:number){
    this.rowExpandIndex=index;        
  }

  Expandable(){
    if(this.internalHeaders==undefined || this.internalHeaders==null)
    {
      return false; 
    }
    for (let v of this.internalHeaders)
    {
        if(v.breakpoints!=undefined && v.breakpoints!=null && v.breakpoints!='')
        {
            if(v.breakpoints.split(',').findIndex(item => item === this.viewPort) != -1)
            {
                return true;
            }
        }
        //console.log(v);
    }
    return false;
  }

  ColumnVisibility(breakpoints:string){
    if(breakpoints==undefined || breakpoints==null || breakpoints=='')
      return true;

    let array = breakpoints.split(',');
    return array.findIndex(item => item === this.viewPort) == -1?true:false;
  }

  setPage(page: number) {
    if(!this.internalDataPaging || this.internalData==undefined || this.internalData==null)
    {
      return;
    }

    if(!this.internalDataPaging)
    {
      this.pagedItems = this.internalData
      return;
    }

    // if (page < 1 || page > this.pager.totalPages) {
    //     return;
    // }

    if (page < 1) {
        page = 1;
    }

    // get pager object from service
    this.pager = this.pagerService.getPager(this.internalData.length, page, this.getPageSize());

    // get current page of items
    this.pagedItems = this.internalData.slice(this.pager.startIndex, this.pager.endIndex + 1);

    this.rowExpandIndex = -1;
  }

  OnSearchFinish(a: any, col:any) {
    let i:number = this.internalHeaders.findIndex(i=>i.name==col.name);
    this.internalHeaders[i].filterMinValue = a.from;
    this.internalHeaders[i].filterMaxValue = a.to;
  }

  // Change sort function to this: 
  sort(item:any){
      let property:string = item.name;
      let canSort:boolean = item.canSort;
      let dataType:string = item.dataType;
      if(!canSort)
      {
        return;
      }
      this.isDesc = !this.isDesc; //change the direction    
      this.column = property;
      let direction = this.isDesc ? 1 : -1;

      if(dataType!='date')
      {
        this.internalData.sort(function(a, b){
            if(a[property] < b[property]){
                return -1 * direction;
            }
            else if( a[property] > b[property]){
                return 1 * direction;
            }
            else{
                return 0;
            }
        });
      }
      else
      {
        this.internalData.sort(function(a, b){
            if(moment(a[property]).diff(moment(b[property]), 'days')<0){
                return -1 * direction;
            }
            else if(moment(a[property]).diff(moment(b[property]), 'days')>0){
                return 1 * direction;
            }
            else{
                return 0;
            }
        });
      }
      this.setPage(this.pager.currentPage);
  }

  // Filter
  doFilter(){
    let headers:any = this.internalHeaders;
    this.internalData = this.internalDataWithoutFilter.filter(function(item){
      var matchesAll = true;
      for(var i = 0; i<headers.length; i++){
        if(!headers[i].canfilter){
          continue;
        }
        let validProperty:boolean = item.hasOwnProperty(headers[i].name);
        if(!validProperty)
        {
          continue;
        }

        let isString:boolean = (headers[i].dataType == undefined || headers[i].dataType == '' || headers[i].dataType == 'string');
        let isNumber:boolean = headers[i].dataType == 'number';
        let isDate:boolean = headers[i].dataType == 'date';

        let isContains:boolean = (
          headers[i].filterType == undefined 
          || headers[i].filterType == '' 
          || headers[i].filterType == 'Contains'
          || (headers[i].filterType != 'Equal' && headers[i].filterType != 'StartsWith' && headers[i].filterType != 'EndsWith')
          );
        
        let isApplyEqual:boolean = (
          headers[i].filterType == 'Equal'
          || (headers[i].filterType != 'LessThan' && headers[i].filterType != 'GreaterThan' && headers[i].filterType != 'LessThanEqual' && headers[i].filterType != 'GreaterThanEqual' && headers[i].filterType != 'Range')
          );

        let isSkipFilter:boolean = (!isString || headers[i].filterValue == undefined || headers[i].filterValue == '');
        let isSkipNumberFilter:boolean = (!isNumber || headers[i].filterValue == undefined || headers[i].filterValue == '');
        let isSkipDateFilter:boolean = (!isDate || headers[i].filterValue == undefined || headers[i].filterValue == '');

        let isSkipNumberMinFilter:boolean = (!isNumber || headers[i].filterMinValue==undefined || headers[i].filterMinValue == '')
        let isSkipNumberMaxFilter:boolean = (!isNumber || headers[i].filterMaxValue==undefined || headers[i].filterMaxValue == '')
        let isSkipDateMinFilter:boolean = (!isDate || headers[i].filterMinValue==undefined || headers[i].filterMinValue == '')
        let isSkipDateMaxFilter:boolean = (!isDate || headers[i].filterMaxValue==undefined || headers[i].filterMaxValue == '')
        
        let stringFilterValue:string = '';
        if(!isSkipFilter){
          stringFilterValue = headers[i].filterValue.toLowerCase();          
        }          

        //console.log(headers[i].dataType + ' - ' + headers[i].filterType + ' - ' + headers[i].filterValue + headers[i].filterMinValue + '-' + headers[i].filterMaxValue)
        // check if your data contains the column and the value defined in args.
        if(validProperty &&
            (
              (isSkipFilter 
                || (isString && isContains && item[headers[i].name].toLowerCase().indexOf(stringFilterValue)>-1)
                || (isString && headers[i].filterType == 'Equal' && item[headers[i].name].toLowerCase() == stringFilterValue)
                || (isString && headers[i].filterType == 'StartsWith' && item[headers[i].name].toLowerCase().indexOf(stringFilterValue)===0)
                || (isString && headers[i].filterType == 'EndsWith' && item[headers[i].name].toLowerCase().slice(item[headers[i].name].length-stringFilterValue.length)===stringFilterValue)
              )
              &&
              (isSkipNumberFilter 
                || (isNumber && isApplyEqual && item[headers[i].name] == headers[i].filterValue)
                || (isNumber && headers[i].filterType == 'LessThan' && item[headers[i].name] < headers[i].filterValue)
                || (isNumber && headers[i].filterType == 'GreaterThan' && item[headers[i].name] > headers[i].filterValue)
                || (isNumber && headers[i].filterType == 'LessThanEqual' && item[headers[i].name] <= headers[i].filterValue)
                || (isNumber && headers[i].filterType == 'GreaterThanEqual' && item[headers[i].name] >= headers[i].filterValue)
              )
              && (isSkipNumberMinFilter || (isNumber && headers[i].filterType == 'Range' && item[headers[i].name] >= headers[i].filterMinValue) && (isSkipNumberMaxFilter || item[headers[i].name] <= headers[i].filterMaxValue))
              &&
              (isSkipDateFilter
                || (isDate && isApplyEqual && moment(item[headers[i].name]).diff(moment(headers[i].filterValue), 'days')==0)
                || (isDate && headers[i].filterType == 'LessThan' && moment(item[headers[i].name]).diff(moment(headers[i].filterValue), 'days')<0)
                || (isDate && headers[i].filterType == 'GreaterThan' && moment(item[headers[i].name]).diff(moment(headers[i].filterValue), 'days')>0)
                || (isDate && headers[i].filterType == 'LessThanEqual' && moment(item[headers[i].name]).diff(moment(headers[i].filterValue), 'days')<=0)
                || (isDate && headers[i].filterType == 'GreaterThanEqual' && moment(item[headers[i].name]).diff(moment(headers[i].filterValue), 'days')>=0)

              )
              && (isSkipDateMinFilter || (isDate && headers[i].filterType == 'Range' && moment(item[headers[i].name]).diff(moment(headers[i].filterMinValue), 'days')>=0) && (isSkipDateMaxFilter || moment(item[headers[i].name]).diff(moment(headers[i].filterMaxValue), 'days')<=0))
            )
          ){
          continue;
        }else{ // at least one column did not match,
          matchesAll = false;
        }
      }
      return matchesAll;        
    });

    //a[item.name].toLowerCase().indexOf(item.filterValue.toLowerCase()) > -1

    this.update.emit({
        totalRows: this.internalData.length
    });
    this.setPage(1);
    this.colFilterIndex=-1;
  }

  ChangeCheckboxSelection(e: any, item:any){
    let i: number = this.internalDataWithoutFilter.findIndex(x => x.globalRowIndex === item.globalRowIndex);
    if (e.target.checked) {
        this.internalDataWithoutFilter[i].IsChecked = true;
    }
    else {
        this.internalDataWithoutFilter[i].IsChecked = false;
    }
  }

  SelectedRow(item:any){
    this.selectedRow.emit({
        selectedItem: item
    });
  }
}
