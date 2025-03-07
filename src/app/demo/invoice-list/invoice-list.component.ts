import { Component, QueryList, ViewChildren, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { Invoicemodel } from './invoice-list.model';
import { InvoicelistService } from './invoice-list.service';
import { NgbdSortableHeader, SortEvent } from './sortable.directive';
import { AuthenticationService } from '../../core/services/auth.service';
import { ReactiveFormsModule, FormsModule, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators, ValidationErrors, AbstractControl } from '@angular/forms';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import * as moment from 'moment-timezone';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { GlobalService } from '../core/services/global.service';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, PaginationModule, NgxSpinnerModule],
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss'],
  providers: [DecimalPipe, InvoicelistService, NgxSpinnerService]
})
export class InvoiceListComponent implements OnInit {
  selectedStartDate: string | null = null;
  selectedEndDate: string | null = null;
  selectedStage: string | null = null;
  modalRef?: BsModalRef;
  dateFilterModalRef?: BsModalRef;
  selectedLocation: string = 'allLocation';
  userLocation: string = 'Mumbai';
  formFilter: UntypedFormGroup;
  dateFilterForm: FormGroup;
  content?: any;
  lists?: any;
  invoiceList!: Observable<Invoicemodel[]>;
  invoiceFile: File;
  total$: Observable<number>;
  @ViewChildren(NgbdSortableHeader) headers!: QueryList<NgbdSortableHeader>;
  currentPage: any;
  page = 1;
  pageSize = 5;
  collectionSize: number = 0;
  isdataloaded: boolean = false;
  uploadForm!: UntypedFormGroup;
  submitted: boolean = false;
  stages: any[] = [];

  constructor(
    private modalService: BsModalService,
    public service: InvoicelistService,
    private globalService: GlobalService,
    private spinner: NgxSpinnerService,
    private formBuilder: UntypedFormBuilder,
    private authService: AuthenticationService,
    private router: Router
  ) {
    this.invoiceList = service.invoiceList$;
    this.total$ = service.total$;
    this.dateFilterForm = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    }, { validators: this.dateRangeValidator });
  }

  ngOnInit(): void {
    console.log("show loader");
    this.spinner.show();

    this.userLocation = this.globalService.getUserLocation();

    this.service.getStages().subscribe({
      next: (data) => {
          this.stages = data;
      },
      error: (err) => {
          console.error('Error fetching stages:', err);
      }
    });

    this.loadFiltersFromLocalStorage();
    this.getInvoicelist();

    this.formFilter = this.formBuilder.group({
      searchInput: ['']
    });

    this.uploadForm = this.formBuilder.group({
      id: "11",
      ids: [''],
      invoicefile: ['', [Validators.required]]
    });

    this.invoiceList.subscribe(x => {
      this.content = this.lists;
      this.lists = Object.assign([], x);
    });

    if (sessionStorage == null || sessionStorage.length <= 0) {
      this.authService.logout();
    } else {
      this.getInvoicelist();
    }
  }

  onLocationChange(event: Event, value: string) {
    event.preventDefault();
    this.selectedLocation = value;
    console.log('Selected Location:', value);
  
    // Save the filter to local storage
    this.saveFiltersToLocalStorage();
  
    // Check if "My Location" is selected
    if (value === 'myLocation') {
      // Refresh the page to apply the location filter correctly
      window.location.reload();
    } else {
      // Fetch the invoice list with the updated location filter
      this.getInvoicelist();
    }
  }

  @HostListener('window:load', ['$event'])
  onWindowLoad(event: Event): void {
    console.log('Window fully loaded');
    this.spinner.hide();

    if (sessionStorage == null || sessionStorage.length <= 0) {
      this.authService.logout();
    } else {
      this.getInvoicelist();
    }
  }

  get uploadform() {
    return this.uploadForm.controls;
  }

  onFileSelected(event: any) {
    console.log("onFileSelected");
    this.invoiceFile = event.target.files[0] as File;
    console.log("invoiceFile ", this.invoiceFile);
  }

  openUploadModal(content: any) {
    this.submitted = false;
    this.modalRef = this.modalService.show(content, { class: 'modal-md' });
    this.uploadForm.reset({});
  }

  openDateFilterModal(content: any) {
    // Set form values to selected dates
    this.dateFilterForm.patchValue({
      startDate: this.selectedStartDate,
      endDate: this.selectedEndDate,
    });

    // Open the modal
    this.dateFilterModalRef = this.modalService.show(content);
  }

  closeDateFilterModal(): void {
    this.dateFilterModalRef?.hide();
    this.dateFilterForm.reset();
  }

  getSelectedStageName(): string {
    if (this.selectedStage === null) {
        return 'All';
    }
    const stage = this.stages.find(s => s.id === this.selectedStage);
    return stage ? stage.action : 'All';
  }

  // Apply date filter
  applyDateFilter(): void {
    const startDate = this.dateFilterForm.get('startDate').value;
    const endDate = this.dateFilterForm.get('endDate').value;

    if (!startDate || !endDate) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Date Fields',
        text: 'Both Start Date and End Date are required.',
      });
      return;
    }

    if (moment(endDate).isBefore(startDate)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Date Range',
        text: 'End Date cannot be earlier than Start Date.',
      });
      return;
    }

    // Update selected dates
    this.selectedStartDate = startDate;
    this.selectedEndDate = endDate;

    // Update form controls to reflect selected dates
    this.dateFilterForm.patchValue({
      startDate: this.selectedStartDate,
      endDate: this.selectedEndDate,
    });

    // Save filters to local storage
    this.saveFiltersToLocalStorage();

    // Fetch data with both filters applied
    this.getInvoicelist();
    this.closeDateFilterModal();
  }

  clearDateFilter(): void {
    this.selectedStartDate = null;
    this.selectedEndDate = null;
    this.dateFilterForm.reset();
    this.saveFiltersToLocalStorage();
    this.getInvoicelist();
    this.closeDateFilterModal();
  }

  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('startDate').value;
    const endDate = control.get('endDate').value;
    if (startDate && endDate && moment(endDate).isBefore(startDate)) {
      return { dateRangeInvalid: true };
    }
    return null;
  }

  // Handle start date change
  onStartDateChange(event: Event): void {
    const startDate = (event.target as HTMLInputElement).value;
    this.dateFilterForm.get('endDate').setValue('');
    this.dateFilterForm.get('endDate').updateValueAndValidity();
  }

  // Handle end date change
  onEndDateChange(event: Event): void {
    const endDate = (event.target as HTMLInputElement).value;
    this.dateFilterForm.get('startDate').updateValueAndValidity();
  }

  
  getInvoicelist() {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.spinner.show();

    this.service.getInvoicelist(this.selectedStage).subscribe({
        next: async (x) => {
            if (x != null) {
                let filteredData = x;

                // Apply Location Filter
                if (this.selectedLocation === 'myLocation') {
                    filteredData = filteredData.filter((item) => item['location'] === this.userLocation);
                }

                // Apply Date Filter
                if (this.selectedStartDate && this.selectedEndDate) {
                  const startDate = moment(this.selectedStartDate).startOf('day'); // Start of the day
                  const endDate = moment(this.selectedEndDate).endOf('day'); // End of the day
                  filteredData = filteredData.filter((item) => {
                      const availableDate = moment.utc(item['available-date']).tz(timeZone);
                      return availableDate.isBetween(startDate, endDate, undefined, '[]');
                  });
              }

                this.service.lists = await Promise.all(
                    filteredData.map(async (item) =>
                        await new Promise((resolve) => {
                            item['available-date'] = item['available-date'] ? moment.utc(item['available-date']).tz(timeZone).format('DD/MM/YYYY') : "";
                            item['processed-date'] = item['processed-date'] ? moment.utc(item['processed-date']).tz(timeZone).format('DD/MM/YYYY') : "";
                            item['invoice-date'] = item['invoice-date'] ? moment.utc(item['invoice-date']).tz(timeZone).format('DD/MM/YYYY') : "";
                            resolve(item);
                        })
                    )
                );

                console.log("Filtered Data Length:", this.service.lists.length);
                this.collectionSize = this.service.lists.length;
            }
            this.spinner.hide();
            this.isdataloaded = true;
        },
        error: (err) => {
            this.spinner.hide();
            this.isdataloaded = true;
            Swal.fire('Error', 'Failed to fetch invoice data.', 'error');
        }
    });
  }

  uploadInvoice() {
    if (this.uploadForm.valid) {
      this.spinner.show();

      const formData = new FormData();
      formData.append('invoice-file', this.invoiceFile);

      this.service.uploadInvoice(formData).subscribe({
        next: data => {
          this.spinner.hide();
          Swal.fire({
            title: 'Success!',
            text: 'Invoice uploaded successfully!',
            icon: 'success',
            confirmButtonText: 'ok'
          }).then(result => {
            this.modalService.hide();
            setTimeout(() => {
              this.uploadForm.reset();
            }, 100);
            this.getInvoicelist();
          });
        },
        error: err => {
          this.spinner.hide();
          Swal.fire('Error', 'Something went wrong. Please try again!', 'error');
        }
      });
    }
    this.submitted = true;
  }

  navigatetodetails(ntoken) {
    console.log("navigate ", ntoken);
    this.router.navigate(['/invoice-list/details'], { queryParams: { id: btoa(ntoken) } });
  }

  clearfilter() {
    this.formFilter.controls['searchInput'].setValue("");
  }

  pageChanged(event: any) {
    this.currentPage = event.page;
  }

  onSort({ column, direction }: SortEvent) {
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });
    this.service.sortColumn = column;
    this.service.sortDirection = direction;
  }

  filterByStage(stage) {
    this.selectedStage = stage === 'all' ? null : stage;
    this.saveFiltersToLocalStorage();
    this.getInvoicelist();
  }

  private loadFiltersFromLocalStorage() {
    this.selectedStartDate = localStorage.getItem('selectedStartDate');
    this.selectedEndDate = localStorage.getItem('selectedEndDate');
    this.selectedStage = localStorage.getItem('selectedStage');
    this.selectedLocation = localStorage.getItem('selectedLocation') || 'allLocation';

    if (this.selectedStartDate) {
      this.dateFilterForm.patchValue({ startDate: this.selectedStartDate });
    }
    if (this.selectedEndDate) {
      this.dateFilterForm.patchValue({ endDate: this.selectedEndDate });
    }
  }

  private saveFiltersToLocalStorage() {
    localStorage.setItem('selectedStartDate', this.selectedStartDate || '');
    localStorage.setItem('selectedEndDate', this.selectedEndDate || '');
    localStorage.setItem('selectedStage', this.selectedStage || '');
    localStorage.setItem('selectedLocation', this.selectedLocation);
  }
}
