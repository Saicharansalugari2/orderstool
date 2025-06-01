// src/types/rawOrder.ts
export interface RawOrder {
    id?: string;
    orderNumber: string | number;
    customer: string;
    transactionDate?: string;
    status?: string;
    fromLocation?: string;
    toLocation?: string;
    incoterm?: string;
    freightTerm?: string;
    freightPayment?: string;
    customsClearance?: string;
    customsDuties?: string;
    lines?: unknown[];
  }
  