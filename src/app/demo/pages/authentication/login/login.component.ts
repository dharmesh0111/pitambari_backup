import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIf, CommonModule, NgClass } from '@angular/common';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { RestApi } from '../../../../core/models/rest-api';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../../../core/services/auth.service';
import { TokenService } from '../../../../core/services/token.service';
import Swal from 'sweetalert2';
import { GlobalService } from 'src/app/demo/core/services/global.service';

declare const gapi: any; // Declare gapi

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, NgIf, ReactiveFormsModule, NgClass],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export default class LoginComponent implements OnInit {
  loginForm: UntypedFormGroup;
  submitted: boolean = false;
  error: string = '';
  returnUrl: string;
  year: number = new Date().getFullYear();
  show: boolean = false;
  api = new RestApi();

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private tokenService: TokenService,
    private globalService: GlobalService
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    // Initialize Google Sign-In
    gapi.load('auth2', () => {
      gapi.auth2.init({
        client_id: '431092211101-amjdrdvi0h21orck8mr2tcs5t2i7d6jk.apps.googleusercontent.com',
        scope: 'profile email', // Ensure you have the correct scopes
      }).then(() => {
        console.log('Google Auth Initialized');
      }, (error) => {
        console.error('Google Auth Initialization Error:', error);
      });
    });
  }

  password() {
    this.show = !this.show;
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    let requestBody = {
      username: this.f['email'].value,
      password: this.f['password'].value
    };

    if (this.loginForm.invalid) {
      return;
    }

    this.authenticationService.loginUser(requestBody).subscribe({
      next: data => {
        this.tokenService.saveUserData(data);
        this.tokenService.saveTokenId(data.id);

        sessionStorage.setItem('accesstoken', data.id);
        sessionStorage.setItem('accountId', data.user?.token ?? "0");
        sessionStorage.setItem('realm', data.user?.realm ?? "");
        sessionStorage.setItem('email', data.user?.email ?? "");

        this.globalService.setRealm(data.user?.realm ?? "");
        this.globalService.setUserId(data.user?.id ?? "");
        this.globalService.setUserLocation(data.user?.location ?? '');

        this.router.navigate(['/default']);
      },
      error: err => {
        this.error = "Incorrect username or password";
        Swal.fire('Error', this.error, 'error');
      }
    });
  }

  signInWithGoogle() {
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signIn().then(
      googleUser => {
        const profile = googleUser.getBasicProfile();
        const email = profile.getEmail();
        alert(email)
        console.log(email)

        // Call your backend API to check if the email exists
        this.authenticationService.checkGoogleUser(email).subscribe({
          next: data => {
            if (data.exists) {
              this.tokenService.saveUserData(data);
              this.tokenService.saveTokenId(data.id);

              sessionStorage.setItem('accesstoken', data.id);
              sessionStorage.setItem('accountId', data.user?.token ?? "0");
              sessionStorage.setItem('realm', data.user?.realm ?? "");
              sessionStorage.setItem('email', data.user?.email ?? "");

              this.globalService.setRealm(data.user?.realm ?? "");
              this.globalService.setUserId(data.user?.id ?? "");
              this.globalService.setUserLocation(data.user?.location ?? '');

              this.router.navigate(['/default']);
            } else {
              Swal.fire('Error', 'This email is not authorized.', 'error');
            }
          },
          error: err => {
            Swal.fire('Error', 'Failed to authenticate with Google.', 'error');
          }
        });
      },
      error => {
        Swal.fire('Error', 'Failed to sign in with Google.', 'error');
      }
    );
  }
}
