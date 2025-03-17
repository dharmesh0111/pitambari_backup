import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ReactiveFormsModule, FormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../../core/services/auth.service';
import { InvoicelistService } from '../invoice-list.service';
import * as moment from 'moment-timezone';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { GlobalService } from '../../core/services/global.service';
import { LineItem } from './details.model';
import { LineItemService } from './details.service';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxSpinnerModule],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  providers: [DecimalPipe, NgxSpinnerService, InvoicelistService]
})
export class DetailsComponent implements OnInit {
  invoiceForm!: UntypedFormGroup;
  submitted: boolean = false;
  invoiceToken: string;
  filepath: any;
  safeUrl: SafeResourceUrl;
  lineItems: LineItem[] = [];

  previousId: string | null = null;
  nextId: string | null = null;
  userId: string = ''; // Store user ID from GlobalService

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: UntypedFormBuilder,
    private authService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router,
    public service: InvoicelistService,
    private sanitizer: DomSanitizer,
    private globalService: GlobalService, // Inject GlobalService
    private lineItemService: LineItemService // Inject LineItemService
  ) {
    this.invoiceToken = '';
  }

  ngOnInit(): void {
    this.invoiceForm = this.formBuilder.group({
      action: [''],
      stageText: [''], // Use stageText to display the text representation
      ids: [''],
      invoicedate: [''],
      invoiceno: [''],
      grandtotal: [''],
      barcode: [''],
      'validate-grn-no': [''],
      'multi-grn-no': [''],
      'invoice-type': [''],
      'currency': [''],
      'service-entry-year': [''],
      'service-entry-no': [''],
      'comment': [''],
      'invoice-status': [''],
      isvalidated: ['']
    });

    // Decode the invoice ID from the query parameters
    this.route.queryParams.subscribe(params => {
      const encodedId = params['id'];
      if (encodedId) {
        this.invoiceToken = atob(encodedId);
        console.log('Decoded Invoice ID in DetailsComponent:', this.invoiceToken); // Print the decoded ID
        this.editInvoiceDataGet();
        this.fetchLineItems();
      }
    });
  }

  get invoiceform() {
    return this.invoiceForm.controls;
  }

  editInvoiceDataGet() {
    this.submitted = false;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (this.invoiceToken) {
      this.service.getInvoiceDetails(btoa(this.invoiceToken)).subscribe({
        next: res => {
          var filePath = res['filepath'] != null ? res['filepath'] : "";
          this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(filePath);
          this.invoiceForm.patchValue({
            action: this.getActionFromStage(res.stage),
            stageText: this.getActionFromStage(res.stage), // Set the stageText value
            ids: res.id,
            invoicedate: (res['invoice-date'] ? moment.utc(res['invoice-date']).tz(timeZone).format('YYYY-MM-DD') : ""),
            invoiceno: res['invoice-number'],
            grandtotal: res['grand-total'],
            barcode: res['barcode-number'],
            'validate-grn-no': res['validate-grn-no'],
            'multi-grn-no': res['multi-grn-no'],
            'invoice-type': res['invoice-type'],
            'currency': res['currency'],
            'invoice-status': res['invoice-status'],
            'comment': res['comment'],
            'service-entry-no': res['service-entry-no'],
            'service-entry-year': res['service-entry-year'],
            isvalidated: res['isvalidated'] != null && res['isvalidated'] == '1' ? true : false
          });
          this.service.getAdjacentIds(btoa(this.invoiceToken)).subscribe(({ previous_id, next_id }) => {
            this.previousId = previous_id;
            this.nextId = next_id;
          });
        },
        error: err => {
          Swal.fire('Error', 'Something went wrong. Please try again!', 'error');
          this.spinner.hide();
        }
      });
    }
  }

  goToPrevious(): void {
    if (this.previousId != null) {
      this.invoiceToken = this.previousId;
      this.editInvoiceDataGet();
    }
  }

  goToNext(): void {
    if (this.nextId != null) {
      this.invoiceToken = this.nextId;
      this.editInvoiceDataGet();
    }
  }

  saveInvoice() {
    this.submitted = false;
    if (this.invoiceForm.valid) {
      let dataobj = {};
      dataobj['invoice-date'] = this.invoiceForm.get('invoicedate')?.value;
      dataobj['invoiceno'] = this.invoiceForm.get('invoiceno')?.value;
      dataobj['grandtotal'] = this.invoiceForm.get('grandtotal')?.value;
      dataobj['barcode'] = this.invoiceForm.get('barcode')?.value;
      dataobj['validate-grn-no'] = this.invoiceForm.get('validate-grn-no')?.value;
      dataobj['multi-grn-no'] = this.invoiceForm.get('multi-grn-no')?.value;
      dataobj['invoice-type'] = this.invoiceForm.get('invoice-type')?.value;
      dataobj['currency'] = this.invoiceForm.get('currency')?.value;
      dataobj['service-entry-year'] = this.invoiceForm.get('service-entry-year')?.value;
      dataobj['service-entry-no'] = this.invoiceForm.get('service-entry-no')?.value;
      dataobj['invoice-status'] = this.invoiceForm.get('invoice-status')?.value;
      dataobj['comment'] = this.invoiceForm.get('comment')?.value;
      dataobj['isvalidated'] = ((document.getElementById("isvalidated") as HTMLInputElement).checked == true ? "1" : "0");

      // Determine the stage based on user actions
      if (dataobj['invoice-status'] === 'Accept' && dataobj['isvalidated'] === '1') {
        dataobj['stage'] = 5; // Verified & Accepted
      } else if (dataobj['invoice-status'] === 'Reject' && dataobj['isvalidated'] === '1') {
        dataobj['stage'] = 6; // Verified & Rejected
      } else if (dataobj['invoice-status'] === 'Accept' && dataobj['isvalidated'] !== '1') {
        dataobj['stage'] = 4; // In Verification
      } else if (dataobj['invoice-status'] === 'Reject' && dataobj['isvalidated'] !== '1') {
        dataobj['stage'] = 4; // In Verification
      } else {
        dataobj['stage'] = 2; // Exception
      }

      if (this.invoiceForm.get('ids')?.value) {
        this.service.updateInvoice(btoa(this.invoiceToken), dataobj).subscribe({
          next: data => {
            Swal.fire({
              title: 'Success!',
              text: 'Invoice details updated successfully!',
              icon: 'success',
              confirmButtonText: 'ok'
            }).then(result => {
              this.invoiceForm.reset();
              this.editInvoiceDataGet();
            });
          },
          error: err => {
            Swal.fire('Error', 'Something went wrong. Please try again!', 'error');
          }
        });
      } else {
        Swal.fire('Error', 'Something went wrong. Please try again!', 'error');
      }
    }
    this.submitted = true;
  }

  getActionFromStage(stage: number): string {
    switch (stage) {
      case 1:
        return 'Pending';
      case 2:
        return 'Exception';
      case 3:
        return 'Processed & Awaiting Verification';
      case 4:
        return 'In Verification';
      case 5:
        return 'Verified & Accepted';
      case 6:
        return 'Verified & Rejected';
      default:
        return '';
    }
  }

  fetchLineItems(): void {
    console.log('Fetching line items for invoice ID:', this.invoiceToken);
    this.lineItemService.getLineItemsByInvoiceId(this.invoiceToken).subscribe(
      (data) => {
        console.log('Raw data received from API:', data);
        if (data && Array.isArray(data)) {
          this.lineItems = data;
          console.log('Line items set:', this.lineItems);
          if (this.lineItems.length === 0) {
            console.log('No line items found for the invoice ID:', this.invoiceToken);
          }
        } else {
          console.error('Unexpected data format received from API:', data);
        }
      },
      (error) => {
        console.error('Error fetching line items', error);
      }
    );
  }
  
}
