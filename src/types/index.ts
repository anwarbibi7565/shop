export type RepairStatus =
  | 'pending'
  | 'in_progress'
  | 'waiting_for_parts'
  | 'repaired'
  | 'ready_for_delivery'
  | 'delivered'
  | 'unrepairable'
  | 'cancelled';

export type PaymentMethod =
  | 'cash'
  | 'bank_transfer'
  | 'jazzcash'
  | 'easypaisa'
  | 'other';

export type PaymentStatus = 'unpaid' | 'partially_paid' | 'fully_paid';

export type CurrencyCode = 'PKR' | 'USD' | 'INR' | 'AED' | 'SAR' | 'EUR' | 'GBP';

export type LanguageCode = 'en' | 'ur';

export type DateFilterRange =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'custom';

export interface Customer {
  id: string;
  name: string;
  mobile_number: string;
  additional_number?: string;
  address?: string;
  created_at: string;
}

export interface AccessoryItem {
  id: string;
  label: string;
  labelUrdu: string;
}

export interface RepairJob {
  id: string;
  job_id: string; // e.g. REP-00001
  customer_id: string;
  customer_name: string;
  mobile_number: string;
  additional_number?: string;
  address?: string;
  mobile_brand: string;
  mobile_model: string;
  imei_number?: string;
  device_problem: string;
  device_condition?: string;
  accessories: string[];
  other_accessory_note?: string;
  received_date: string; // YYYY-MM-DD
  received_time: string; // HH:mm
  expected_delivery_date?: string;
  repairing_cost: number;
  repair_status: RepairStatus;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransaction {
  id: string;
  job_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string; // YYYY-MM-DD
  payment_time: string; // HH:mm
  notes?: string;
  created_at: string;
}

export interface StatusHistory {
  id: string;
  job_id: string;
  previous_status: RepairStatus;
  new_status: RepairStatus;
  changed_at: string;
  changed_by: string;
  notes?: string;
}

export interface DeliveryRecord {
  id: string;
  job_id: string;
  delivery_date: string;
  delivery_time: string;
  delivered_to: string;
  delivered_by: string;
  final_payment_collected: number;
  delivery_notes?: string;
  created_at: string;
}

export interface ShopSettings {
  shop_name: string;
  shop_logo: string;
  shop_address: string;
  shop_phone: string;
  shop_email: string;
  receipt_footer_message: string;
  selected_currency: CurrencyCode;
  currency_symbol: string;
  selected_language: LanguageCode;
  theme: 'light' | 'dark';
  date_format: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  time_format: '12h' | '24h';
}

export interface DashboardMetrics {
  totalReceived: number;
  totalRepaired: number;
  pendingRepairs: number;
  readyForDelivery: number;
  totalDelivered: number;
  totalRepairingAmount: number;
  totalPaymentsReceived: number;
  totalOutstandingBalance: number;
}
