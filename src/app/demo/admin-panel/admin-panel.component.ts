import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlobalService } from '../core/services/global.service';
import { AccountUserService } from './admin-panel.service';
import { AccountUser } from './admin-panel.model';
import { Router } from '@angular/router';
import { TokenService } from 'src/app/core/services/token.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {
  value: string = '';
  userId: string = '';
  location: string = '';
  accountUserList: AccountUser[] = [];
  isDataLoaded: boolean = false;
  editingUser: AccountUser | null = null;

  // Define the lists of options for roles and locations
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
  ]; // Example locations

  constructor(
    private globalService: GlobalService,
    private accountUserService: AccountUserService,
    private router: Router,
    private tokenService: TokenService
  ) {}

  ngOnInit() {
    this.value = this.globalService.getRealm();
    this.userId = this.globalService.getUserId();
    this.location = this.globalService.getUserLocation();
    console.log("Admin Panel Realm:", this.value);
    console.log("Admin Panel User ID:", this.userId);

    this.getAccountUserList();
  }

  getAccountUserList(): void {
    this.accountUserService.getAccountUserList().subscribe({
      next: (data) => {
        if (data != null) {
          this.accountUserList = data;
          this.isDataLoaded = true;
        }
      },
      error: (err) => {
        console.error('Error fetching account user list', err);
        this.isDataLoaded = true;
        Swal.fire("Error", "Failed to fetch user list. Please try again.", "error");
      }
    });
  }

  editUser(user: AccountUser): void {
    this.editingUser = { ...user }; // Create a copy of the user to edit
  }

  saveUser(user: AccountUser): void {
    console.log('Updating user:', user);
    const token = this.tokenService.getTokenId();
    console.log('Token:', token);

    this.accountUserService.editUser(user.id, user).subscribe({
      next: (updatedUser) => {
        console.log('User updated successfully', updatedUser);
        Swal.fire("Success", "User updated successfully!", "success");
        this.getAccountUserList(); // Refresh the user list
        this.editingUser = null; // Clear the editing state
      },
      error: (err) => {
        if (err.status === 403) {
          Swal.fire("Forbidden", "You do not have permission to update this user.", "error");
        } else {
          Swal.fire("Error", "Failed to update user. Please check your input.", "error");
        }
      }
    });
  }

  // deleteUser(id: number): void {
  //   console.log(this.tokenService.getTokenId());
  //   Swal.fire({
  //     title: 'Are you sure?',
  //     text: "You won't be able to revert this!",
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#3085d6',
  //     cancelButtonColor: '#d33',
  //     confirmButtonText: 'Yes, delete it!'
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       this.accountUserService.deleteUser(id).subscribe({
  //         next: (response) => {
  //           console.log('User deleted successfully', response);
  //           Swal.fire("Success", "User deleted successfully!", "success");
  //           this.getAccountUserList(); // Refresh the user list
  //         },
  //         error: (err) => {
  //           Swal.fire("Error", "Failed to delete user. Please try again.", "error");
  //         }
  //       });
  //     }
  //   });
  // }

  navigateToUserRegister(): void {
    this.router.navigate(['/user-register']);
  }

  cancelEdit(): void {
    this.editingUser = null; // Clear the editing state
  }

  onEnter(user: AccountUser): void {
    this.saveUser(user);
  }
}
