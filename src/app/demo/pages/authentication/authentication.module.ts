import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AlertModule } from 'ngx-bootstrap/alert';
// import { CarouselModule } from 'ngx-owl-carousel-o';
import { PaginationModule } from 'ngx-bootstrap/pagination';  // Import PaginationModule

import { AuthenticationRoutingModule } from './authentication-routing.module';

@NgModule({
  declarations: [],
  imports: [CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AlertModule.forRoot(), AuthenticationRoutingModule,PaginationModule.forRoot()]
})
export class AuthenticationModule {}
