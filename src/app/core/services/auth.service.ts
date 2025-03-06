import { Injectable } from '@angular/core';

// import { getFirebaseBackend } from '../../authUtils';

import { User } from '../models/auth.models';

import { HttpBackend, HttpClient } from '@angular/common/http';

import { Router } from '@angular/router';
import { RestApi } from '../models/rest-api';
import { Observable } from 'rxjs';
import { TokenService } from '../../core/services/token.service';
// import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })

export class AuthenticationService {

    user: User;

    api = new RestApi();
    constructor(public httpClient:HttpClient,
        public handler: HttpBackend,
        private router:Router,
        private tokenService: TokenService) {
    }

    /**
     * Returns the current user
     */
    // public currentUser(): User {
    //     return getFirebaseBackend().getAuthenticatedUser();
    // }

    /**
     * Performs the auth
     * @param email email of user
     * @param password password of user
     */
    // login(email: string, password: string) {
    //     return getFirebaseBackend().loginUser(email, password).then((response: any) => {
    //         const user = response;
    //         return user;
    //     });
    // }

    
    loginUser(authBody:any) : Observable<any>{
        const http = new HttpClient(this.handler)
        const url = `${this.api.LOGIN_URL}`;
        return http.post<any>(url, authBody);
    } 




    logout = () => {
      
      
      this.tokenService.signOut();
      sessionStorage.clear();
      localStorage.clear();

      this.router.navigate(['/guest/login']);
          
  }
      /**
   * Checks if a Google user's email exists in the database
   * @param email Google user's email
   */
  checkGoogleUser(email: string): Observable<any> {
    const http = new HttpClient(this.handler);
    const url = `${this.api.BASE_URL}/AccountUsers/checkGoogleUser`;
    return http.post<any>(url, { email });
  }


  handleError(jqXHR: any) {
    console.log("handle ",jqXHR);
    var errmsg =  "Something went wrong. Please try again.";
    if (jqXHR.status === 0) {
        
        errmsg = 'Not connected.\nPlease verify your network connection.';
    } else if (jqXHR.status == 404) {
        errmsg =  'The requested page not found.';
    }  else if (jqXHR.status == 401) {
        errmsg =  'Sorry!! You session has expired. Please login to continue access.';
    } else if (jqXHR.status == 500) {
        errmsg =  'Internal Server Error.';
    // } else if (exception === 'parsererror') {
    //     errmsg =  "Something went wrong. Please try again.";
    //     // errmsg =  'Requested JSON parse failed.';
    // } else if (exception === 'timeout') {
    //     errmsg =  'Time out error.';
    // } else if (exception === 'abort') {
    //     // errmsg =  'Ajax request aborted.';
    //     errmsg =  "Something went wrong. Please try again.";
    } else {
        errmsg =  'Unknown error occurred. Please try again.';
        if(jqXHR.message){
            errmsg = jqXHR.message;
        }
        if(jqXHR.error && jqXHR.error.error){
            errmsg = jqXHR.error.error.message ? jqXHR.error.error.message : errmsg;
            if(jqXHR.error.error.details){
            errmsg = jqXHR.error.error.details.message ? jqXHR.error.error.details.message : errmsg;
            if(jqXHR.error.error.details.messages){
                var msgarr = jqXHR.error.error.details.messages;
                var msgstr = "";
                
                msgarr.forEach((value, index) => {
                    if(value['message'] !=null){
                        msgstr += value['message']+"\n";
                    }else{
                        msgstr += index+" "+value+"\n";
                    }
                });
                errmsg = msgstr;
            }
            }
        }
    }    
    if (jqXHR.status == 401) {      
      // this.logout();
    } else{
      
      // Swal.fire ('Error', errmsg, 'error');
    }
  }
}

