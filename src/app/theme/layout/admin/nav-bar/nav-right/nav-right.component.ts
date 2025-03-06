// Angular import
import { Component,OnInit } from '@angular/core';
import { AuthenticationService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-nav-right',
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent implements OnInit {
  constructor(
     private authService: AuthenticationService
     ) {
    
      
}

ngOnInit() {
}
  logout() {

    //   this.authService.logout().subscribe({
    //     next:data=>{
    //     console.log("dash", JSON.stringify(data));
       
    //   },error:  err=> {
    //     // this.error="Incorrect user name or password";
    //     // this.spinner.hide();
    //   }
    // })
      this.authService.logout();
      // if (environment.defaultauth === 'firebase') {
      //   this.authService.logout();
      // } else {
      //   this.authFackservice.logout();
      // }
      // this.router.navigate(['/account/login']);
    }
}
