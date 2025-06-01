
export interface RawOrder {
    id?: string;
    orderNumber: string | number;
    customer: string;
    transactionDate?: string;
    status?: string;
    fromLocation?: string;
    toLocation?: string;
    pendingApprovalReasonCode?: string[];
    supportRep?: string;
    incoterm?: string;
    freightTerms?: string;
    freightTerm?: string;
    freightPayment?: string;
    customsClearance?: string;
    customsDuties?: string;
    totalShipUnitCount?: number;
    totalQuantity?: number;
    discountRate?: number;
    billingAddress?: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    shippingAddress?: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    earlyPickupDate?: string;
    latePickupDate?: string;
    lines?: Array<{
      id?: string;
      item?: string;
      units?: string;
      quantity?: number;
      price?: number;
      amount?: number;
    }>;
    history?: Array<{
      timestamp: string;
      event: string;
    }>;
}
  