import {Injectable, PipeTransform} from '@angular/core';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';

import {Invoicemodel} from './invoice-list.model';
import {DecimalPipe} from '@angular/common';
import {debounceTime, delay, switchMap, tap} from 'rxjs/operators';
import {SortColumn, SortDirection} from './sortable.directive';

import { HttpBackend, HttpClient } from '@angular/common/http';
import { RestApi } from '../../core/models/rest-api';
import { TokenService } from '../../core/services/token.service';
// import * as moment from 'moment';

interface SearchResult {
  invoiceList: Invoicemodel[];
  total: number;
}

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  startIndex: number;
  endIndex: number;
  totalRecords: number;
  property: string;
  status: string;
  location: string;
}

const compare = (v1: string | number, v2: string | number) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

function sort(userList: Invoicemodel[], column: SortColumn, direction: string): Invoicemodel[] {
  if (direction === '' || column === '') {
    return userList;
  } else {
    return [...userList].sort((a, b) => {
      const res = compare(a[column], b[column]);
      return direction === 'asc' ? res : -res;
    });
  }
}

function matches(country: Invoicemodel, term: string, pipe: PipeTransform) {
  console.log("coutry ",country);
  return (country['filename'] !=null && country['filename'] !="" && country['filename'].toLowerCase().includes(term.toLowerCase())) || 
  (country['available-date'] !=null && country['available-date'] !="" && country['available-date'].toLowerCase().includes(term.toLowerCase())) || 
  (country['processed-date'] !=null && country['processed-date'] !="" && country['processed-date'].toLowerCase().includes(term.toLowerCase())) || 
  (country['invoice-number'] !=null && country['invoice-number'] !="" && country['invoice-number'].toLowerCase().includes(term.toLowerCase())) || 
  (country['status'] !=null && country['status'] !="" && country['status'].toLowerCase().includes(term.toLowerCase())) || 
  (country['location'] !=null && country['location'] !="" && country['location'].toLowerCase().includes(term.toLowerCase())) || 
  (country['total-field'] !=null && country['total-field'] !="" && country['total-field'].toString().toLowerCase().includes(term.toLowerCase())) || 
  (country['extracted-field'] !=null && country['extracted-field'] !="" && country['extracted-field'].toString().toLowerCase().includes(term.toLowerCase())) || 
  (country['accuracy'] !=null && country['accuracy'] !="" && country['accuracy'].toString().toLowerCase().includes(term.toLowerCase())) || 
  (country['vendor-name'] !=null && country['vendor-name'] !="" && country['vendor-name'].toLowerCase().includes(term.toLowerCase())) 
  
  ;
   
}

@Injectable({
  providedIn: 'root'
})
export class InvoicelistService {

  public  lists:Invoicemodel[]=[];

  // constructor() { }
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private invoiceLlist$ = new BehaviorSubject<Invoicemodel[]>([]);
  private _total$ = new BehaviorSubject<number>(0);

  content?: any;
  products?: any;

  api = new RestApi();
  private _state: State = {
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: '',
    sortDirection: '',
    startIndex: 0,
    endIndex: 9,
    totalRecords: 0,
    property: null,
    status: null,
    location: null
  };

  constructor(private pipe: DecimalPipe,
    public httpClient:HttpClient,
    private tokenService: TokenService) {
    this._search$.pipe(
      tap(() => this._loading$.next(true)),
      debounceTime(200),
      switchMap(() => this._search()),
      delay(200),
      tap(() => this._loading$.next(false))
    ).subscribe(result => {
      this.invoiceLlist$.next(result.invoiceList);
      this._total$.next(result.total);
    });

    this._search$.next();
  }

  get invoiceList$() { return this.invoiceLlist$.asObservable(); }
  // get product() { return this.products; }
  get total$() { return this._total$.asObservable(); }
  get loading$() { return this._loading$.asObservable(); }
  get page() { return this._state.page; }
  get pageSize() { return this._state.pageSize; }
  get searchTerm() { return this._state.searchTerm; }
  get startIndex() { return this._state.startIndex; }
  get endIndex() { return this._state.endIndex; }
  get totalRecords() { return this._state.totalRecords; }
  get property() { return this._state.property; }
  get status() { return this._state.status; }
  get location() { return this._state.location; }

  set page(page: number) { this._set({page}); }
  set pageSize(pageSize: number) { this._set({pageSize}); }
  set searchTerm(searchTerm: string) { this._set({searchTerm}); }
  set sortColumn(sortColumn: SortColumn) { this._set({sortColumn}); }
  set sortDirection(sortDirection: SortDirection) { this._set({sortDirection}); }
  set startIndex(startIndex: number) { this._set({ startIndex }); }
  set endIndex(endIndex: number) { this._set({ endIndex }); }
  set totalRecords(totalRecords: number) { this._set({ totalRecords }); }
  set property(property: any) { this._set({property}); }
  set status(status: any) { this._set({status}); }
  set location(location: any) { this._set({location}); }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._search$.next();
  }

  private _search(): Observable<SearchResult> {
    const {sortColumn, sortDirection, pageSize, page, searchTerm, property,status,location} = this._state;

    // 1. sort
    // let userList = sort(ClientListdata, sortColumn, sortDirection);    
    let invoiceList = sort(this.lists, sortColumn, sortDirection);    

    // 2. filter
    if(searchTerm){
      invoiceList = invoiceList.filter(country => matches(country, searchTerm, this.pipe)); 
    } 
    
    // 3. Status Filter
    if(property){
      invoiceList = invoiceList.filter(country => country['property-name'] == property);
    }
    else{
      invoiceList = invoiceList;
    }
    
    // 3. Status Filter
    if(status){
      invoiceList = invoiceList.filter(country => country['display-status'] == status);
    }
    else{
      invoiceList = invoiceList;
    }
    // 4. location Filter
    if(location){
      invoiceList = invoiceList.filter(country => country['location'] == location);
    }
    else{
      invoiceList = invoiceList;
    }


    const total = invoiceList.length;

    // 3. paginate
    this.totalRecords = invoiceList.length;
    this._state.startIndex = total >0 ? (page - 1) * this.pageSize + 1 : 0;
    this._state.endIndex = (page - 1) * this.pageSize + this.pageSize;
    if (this.endIndex > this.totalRecords) {
        this.endIndex = this.totalRecords;
    }
    invoiceList = invoiceList.slice(this._state.startIndex - 1, this._state.endIndex);
    return of({invoiceList, total});
  }

  
  
  getInvoicelist(stage?: string):Observable<any>{
    // var obj = JSON.stringify({"id":accountId});
    const url = `${this.api.BASE_URL}/api/invoices/list?access_token=${this.tokenService.getTokenId()}&filter={}&stage=${stage}`;
    return this.httpClient.get<any>(url);
  }  
  uploadInvoice(authBody:any) : Observable<any>{
    const url = `${this.api.BASE_URL}/api/invoices/uploadinvoice?access_token=${this.tokenService.getTokenId()}`;
    return this.httpClient.post<any>(url, authBody);
  }
  
  getInvoiceDetails(nToken:any):Observable<any>{
    // var obj = JSON.stringify({"id":accountId});
    const url = `${this.api.BASE_URL}/api/invoices/`+nToken+`/details?access_token=${this.tokenService.getTokenId()}&&filter={}`;
    return this.httpClient.get<any>(url);
  }  
  
  getAdjacentIds(nToken:any):Observable<any>{
    // var obj = JSON.stringify({"id":accountId});
    const url = `${this.api.BASE_URL}/api/invoices/`+nToken+`/adjacent?access_token=${this.tokenService.getTokenId()}&&filter={}`;
    return this.httpClient.get<any>(url);
  }  
  updateInvoice(nToken:any,authBody:any) : Observable<any>{
    const url = `${this.api.BASE_URL}/api/invoices/`+nToken+`/updateinvoice?access_token=${this.tokenService.getTokenId()}`;
    return this.httpClient.post<any>(url, authBody);
  }

  getStages(): Observable<any> {
    const url = `${this.api.BASE_URL}/api/invoices/getStages?access_token=${this.tokenService.getTokenId()}`;
    return this.httpClient.get<any>(url);
}

}