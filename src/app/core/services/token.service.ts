import { Injectable } from '@angular/core';

const USER_KEY = 'INV_DATA';
const USERID_KEY = 'INV_USER_ID';
const TOKENID_KEY = 'INV_TOKEN_ID';
@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor() { }

  signOut() {
    window.localStorage.clear();
    sessionStorage.clear();
  }

  public saveUserData(body: string) {
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.setItem(USER_KEY, JSON.stringify(body));
  }

  public getUserData(): string {
    return localStorage.getItem(USER_KEY);
  }

  public saveTokenId(id: string) {
    window.localStorage.removeItem(TOKENID_KEY);
    window.localStorage.setItem(TOKENID_KEY, id);
  }

  public getTokenId(): string {
    return localStorage.getItem(TOKENID_KEY);
  }

  public saveUserId(userid: number) {
    window.localStorage.removeItem(USERID_KEY);
    window.localStorage.setItem(USERID_KEY, userid.toString());
  }

  public getUserId(): number {
    return +localStorage.getItem(USERID_KEY);
  }



}

