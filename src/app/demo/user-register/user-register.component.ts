import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountUserService } from '../admin-panel/admin-panel.service';
import { AccountUser } from '../admin-panel/admin-panel.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.scss']
})
export class UserRegisterComponent implements OnInit {
  user: AccountUser = {
    id: 0,
    createdBy: 0,
    createdAt: '',
    lastupdatedBy: 0,
    lastUpdatedAt: '',
    username: '',
    password: '',
    realm: '',
    email: '',
    emailVerified: false,
    verificationToken: '',
    location: ''
  };
  confirmPassword: string = '';

  // Define roles and locations for dropdowns
  roles: string[] = ['Admin', 'Validator']; // Example roles
  locations: string[] = [
    'ESS',
    'Garv',
    'GGNR&D',
    'GurgaonCentral',
    'JDA',
    'Kakinada',
    'Mahanet',
    'Nagpur',
    'NFS',
    'PGCIL',
    'Rakholi',
    'RJIO',
    'RJIOFTTH',
    'SNL',
    'STCS',
    'TFiber',
    'Varun',
    'Waluj'
  ]; // Updated locations

  constructor(
    private accountUserService: AccountUserService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  onSubmit(): void {
    // Validate the input fields
    if (!this.user.username || !this.user.password || !this.user.email || !this.user.realm || !this.user.location) {
      Swal.fire("Error", "Please fill in all required fields.", "error");
      return;
    }

    // Check if passwords match
    if (this.user.password !== this.confirmPassword) {
      Swal.fire("Error", "Passwords do not match. Please try again.", "error");
      return;
    }

    // Call the service to add the new user
    this.accountUserService.addUser(this.user).subscribe({
      next: (response) => {
        Swal.fire("Success", "User registered successfully!", "success");
        this.router.navigate(['/Report']); // Navigate back to the admin panel
      },
      error: (err) => {
        Swal.fire("Error", "Use strong password or email already exists.", "error");
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/Report']); // Navigate back to the admin panel
  }
}
