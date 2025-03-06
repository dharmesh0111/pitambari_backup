import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RestApi } from '../../core/models/rest-api';
import { TokenService } from '../../core/services/token.service';
import { AccountUser } from './admin-panel.model';

@Injectable({
  providedIn: 'root'
})
export class AccountUserService {
  private api = new RestApi();

  constructor(private httpClient: HttpClient, private tokenService: TokenService) {}

  getAccountUserList(): Observable<AccountUser[]> {
    const url = `${this.api.BASE_URL}/api/accountusers/list?access_token=${this.tokenService.getTokenId()}`;
    return this.httpClient.get<AccountUser[]>(url);
  }

  editUser(id: number, data: Partial<AccountUser>): Observable<AccountUser> {
    const url = `${this.api.BASE_URL}/api/accountusers/${id}/updateUser?access_token=${this.tokenService.getTokenId()}`;
    return this.httpClient.post<AccountUser>(url, data);
  }

  // deleteUser(id: number): Observable<any> {
  //   const url = `${this.api.BASE_URL}/api/accountusers/${id}/delete?access_token=${this.tokenService.getTokenId()}`;
  //   return this.httpClient.delete(url);
  // }

  addUser(user: AccountUser): Observable<AccountUser> {
    const token = this.tokenService.getTokenId();
    const url = `${this.api.BASE_URL}/api/accountusers/adduser?access_token=${this.tokenService.getTokenId()}`;
    return this.httpClient.post<AccountUser>(url, user);
  }
  
}
