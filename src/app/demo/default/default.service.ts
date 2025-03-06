import { Injectable } from '@angular/core';

import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { RestApi } from '../../core/models/rest-api';
import { TokenService } from '../../core/services/token.service';

@Injectable({
  providedIn: 'root'
})
export class DefaultService {

  api = new RestApi();
  constructor(
    public httpClient:HttpClient,
    public handler: HttpBackend,
    private tokenService: TokenService) { }

  getDahshoabrdcount():Observable<any>{
    
    const http = new HttpClient(this.handler);
    const url = `${this.api.BASE_URL}/api/invoices/dashboardcount?filter={}&&access_token=${this.tokenService.getTokenId()}`;
    return http.get<any>(url);
  }
  fetchchartdata(f_startdate:string,f_enddate:string,chartcattype:string):Observable<any>{
    
    const http = new HttpClient(this.handler);
    const url = `${this.api.BASE_URL}/api/invoices/chartdata?filter={"fromdate":"`+f_startdate+`","todate":"`+f_enddate+`","type":"`+chartcattype+`"}&&access_token=${this.tokenService.getTokenId()}`;
    return http.get<any>(url);
  }
}
