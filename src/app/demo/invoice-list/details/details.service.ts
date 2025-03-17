import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LineItem } from './details.model';
import { RestApi } from 'src/app/core/models/rest-api';
import { TokenService } from 'src/app/core/services/token.service';

@Injectable({
  providedIn: 'root'
})
export class LineItemService {
  private api = new RestApi();

  constructor(private httpClient: HttpClient, private tokenService: TokenService) {}

  getLineItemsByInvoiceId(invoiceId: string): Observable<LineItem[]> {
    const url = `${this.api.BASE_URL}/api/accountusers/itemlist?invoice_id=${invoiceId}&access_token=${this.tokenService.getTokenId()}`;
    return this.httpClient.get<LineItem[]>(url);
  }
  
}
