// lineitem.model.ts
export interface LineItem {
    line_item_id: number;
    invoice_id: number;
    Product_description: string;
    SKU: string;
    HSN: string;
    Chargeable_quantity: string;
    Free_quantity: string;
    Shipped_quantity: string;
    Billed_quantity: string;
    Unit: string;
    Discount: string;
    Rate: string;
    MRP: string;
    Amount: string;
    Bill_Total_Amount_Before_Discount: string;
    Bill_Total_Amount_After_Discount: string;
    Bill_Damage_Percent: string;
    Bill_Damage_Amount: string;
    Bill_Discount_Percent: string;
    filename: string;
  }
  