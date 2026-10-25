import {
  Customer,
  RepairJob,
  PaymentTransaction,
  StatusHistory,
  DeliveryRecord,
  ShopSettings,
  RepairStatus,
  PaymentStatus,
  DashboardMetrics,
  DateFilterRange,
} from '../types';

const STORAGE_KEYS = {
  JOBS: 'mrsm_repair_jobs_v1',
  PAYMENTS: 'mrsm_payments_v1',
  HISTORY: 'mrsm_status_history_v1',
  DELIVERIES: 'mrsm_deliveries_v1',
  CUSTOMERS: 'mrsm_customers_v1',
  SETTINGS: 'mrsm_settings_v1',
  JOB_COUNTER: 'mrsm_job_counter_v1',
};

export const DEFAULT_SETTINGS: ShopSettings = {
  shop_name: 'Al-Rehman Mobile Zone & Repairing Lab',
  shop_logo: '/src/assets/images/repair_shop_logo_1792729786411.jpg',
  shop_address: 'Shop #14, Hall Road Mobile Market, Lahore, Pakistan',
  shop_phone: '+92 300 1234567',
  shop_email: 'support@alrehmanrepair.com',
  receipt_footer_message:
    '1. Please inspect device thoroughly upon delivery. 2. Not responsible for devices uncollected after 30 days. 3. 7-day checking warranty on hardware parts replaced (excluding display/water damage).',
  selected_currency: 'PKR',
  currency_symbol: 'Rs.',
  selected_language: 'en',
  theme: 'light',
  date_format: 'DD/MM/YYYY',
  time_format: '12h',
};

// Seed initial realistic data for shop owner on first load
export const getSeedData = () => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const yesterday = new Date(now.getTime() - 86400000).toISOString().split('T')[0];
  const threeDaysAgo = new Date(now.getTime() - 86400000 * 3).toISOString().split('T')[0];

  const jobs: RepairJob[] = [
    {
      id: 'job-1',
      job_id: 'REP-00001',
      customer_id: 'cust-1',
      customer_name: 'Ali Ahmad',
      mobile_number: '0300-4567890',
      additional_number: '0321-9876543',
      address: 'Gulberg III, Lahore',
      mobile_brand: 'Vivo',
      mobile_model: 'Vivo Y20',
      imei_number: '864209041234567',
      device_problem: 'No Display / Blank Screen',
      device_condition: 'Minor Scratches (Normal Wear)',
      accessories: ['Battery', 'SIM Card', 'SIM Tray', 'Mobile Cover'],
      received_date: todayStr,
      received_time: '10:45',
      expected_delivery_date: todayStr,
      repairing_cost: 4500,
      repair_status: 'ready_for_delivery',
      created_at: new Date(now.getTime() - 3600000 * 4).toISOString(),
      updated_at: new Date(now.getTime() - 3600000).toISOString(),
    },
    {
      id: 'job-2',
      job_id: 'REP-00002',
      customer_id: 'cust-2',
      customer_name: 'Muhammad Usman',
      mobile_number: '0312-3456789',
      additional_number: '',
      address: 'Model Town, Lahore',
      mobile_brand: 'Apple (iPhone)',
      mobile_model: 'iPhone 12',
      imei_number: '354890102938475',
      device_problem: 'Battery Drainage / Dead Battery',
      device_condition: 'Clean / Like New',
      accessories: ['Battery', 'Mobile Cover'],
      received_date: todayStr,
      received_time: '11:30',
      expected_delivery_date: todayStr,
      repairing_cost: 8000,
      repair_status: 'in_progress',
      created_at: new Date(now.getTime() - 3600000 * 3).toISOString(),
      updated_at: new Date(now.getTime() - 3600000 * 2).toISOString(),
    },
    {
      id: 'job-3',
      job_id: 'REP-00003',
      customer_id: 'cust-3',
      customer_name: 'Bilal Hassan',
      mobile_number: '0333-7654321',
      additional_number: '0345-1122334',
      address: 'DHA Phase 5, Lahore',
      mobile_brand: 'Samsung',
      mobile_model: 'Galaxy A52',
      imei_number: '359012345678901',
      device_problem: 'Charging Port Issue / Not Charging',
      device_condition: 'Cracked Glass / Back Damaged',
      accessories: ['SIM Card', 'Back Panel'],
      received_date: yesterday,
      received_time: '14:15',
      expected_delivery_date: todayStr,
      repairing_cost: 2500,
      repair_status: 'delivered',
      created_at: new Date(now.getTime() - 86400000 * 1.5).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'job-4',
      job_id: 'REP-00004',
      customer_id: 'cust-4',
      customer_name: 'Hamza Tariq',
      mobile_number: '0301-8899001',
      address: 'Johar Town, Lahore',
      mobile_brand: 'Xiaomi / Redmi',
      mobile_model: 'Redmi Note 11',
      imei_number: '869123049182736',
      device_problem: 'Broken / Cracked Screen',
      device_condition: 'Heavy Scratches / Dented Body',
      accessories: ['Battery', 'SIM Tray', 'Memory Card'],
      received_date: todayStr,
      received_time: '09:15',
      expected_delivery_date: todayStr,
      repairing_cost: 5500,
      repair_status: 'pending',
      created_at: new Date(now.getTime() - 3600000 * 5).toISOString(),
      updated_at: new Date(now.getTime() - 3600000 * 5).toISOString(),
    },
    {
      id: 'job-5',
      job_id: 'REP-00005',
      customer_id: 'cust-5',
      customer_name: 'Zeeshan Butt',
      mobile_number: '0322-5544332',
      address: 'Faisal Town, Lahore',
      mobile_brand: 'Infinix',
      mobile_model: 'Hot 12 Play',
      imei_number: '358912049182049',
      device_problem: 'Water Damaged - Motherboard Short Circuit',
      device_condition: 'Severe Damage / Bent Frame',
      accessories: ['Battery', 'SIM Card'],
      received_date: threeDaysAgo,
      received_time: '16:00',
      expected_delivery_date: yesterday,
      repairing_cost: 1500,
      repair_status: 'unrepairable',
      created_at: new Date(now.getTime() - 86400000 * 3).toISOString(),
      updated_at: new Date(now.getTime() - 86400000 * 2).toISOString(),
    },
  ];

  const payments: PaymentTransaction[] = [
    {
      id: 'pay-1',
      job_id: 'REP-00001',
      amount: 2000,
      payment_method: 'cash',
      payment_date: todayStr,
      payment_time: '10:45',
      notes: 'Advance payment upon receiving',
      created_at: new Date(now.getTime() - 3600000 * 4).toISOString(),
    },
    {
      id: 'pay-2',
      job_id: 'REP-00002',
      amount: 4000,
      payment_method: 'jazzcash',
      payment_date: todayStr,
      payment_time: '11:35',
      notes: 'Advance payment via JazzCash',
      created_at: new Date(now.getTime() - 3600000 * 3).toISOString(),
    },
    {
      id: 'pay-3',
      job_id: 'REP-00003',
      amount: 1000,
      payment_method: 'cash',
      payment_date: yesterday,
      payment_time: '14:20',
      notes: 'Advance deposit',
      created_at: new Date(now.getTime() - 86400000 * 1.5).toISOString(),
    },
    {
      id: 'pay-4',
      job_id: 'REP-00003',
      amount: 1500,
      payment_method: 'easypaisa',
      payment_date: todayStr,
      payment_time: '12:10',
      notes: 'Final payment upon delivery',
      created_at: new Date(now.getTime() - 3600000 * 2).toISOString(),
    },
    {
      id: 'pay-5',
      job_id: 'REP-00004',
      amount: 1500,
      payment_method: 'cash',
      payment_date: todayStr,
      payment_time: '09:20',
      notes: 'Advance booking payment',
      created_at: new Date(now.getTime() - 3600000 * 5).toISOString(),
    },
    {
      id: 'pay-6',
      job_id: 'REP-00005',
      amount: 1500,
      payment_method: 'cash',
      payment_date: threeDaysAgo,
      payment_time: '16:05',
      notes: 'Inspection & service check fee',
      created_at: new Date(now.getTime() - 86400000 * 3).toISOString(),
    },
  ];

  const history: StatusHistory[] = [
    {
      id: 'hist-1',
      job_id: 'REP-00001',
      previous_status: 'pending',
      new_status: 'in_progress',
      changed_at: new Date(now.getTime() - 3600000 * 3).toISOString(),
      changed_by: 'Senior Tech Raza',
      notes: 'Original LCD panel replaced with OEM display.',
    },
    {
      id: 'hist-2',
      job_id: 'REP-00001',
      previous_status: 'in_progress',
      new_status: 'repaired',
      changed_at: new Date(now.getTime() - 3600000 * 2).toISOString(),
      changed_by: 'Senior Tech Raza',
      notes: 'Touch and display thoroughly checked. Passed QC.',
    },
    {
      id: 'hist-3',
      job_id: 'REP-00001',
      previous_status: 'repaired',
      new_status: 'ready_for_delivery',
      changed_at: new Date(now.getTime() - 3600000).toISOString(),
      changed_by: 'Shop Admin',
      notes: 'Customer notified via SMS/Call to collect.',
    },
    {
      id: 'hist-4',
      job_id: 'REP-00003',
      previous_status: 'ready_for_delivery',
      new_status: 'delivered',
      changed_at: new Date(now.getTime() - 3600000 * 2).toISOString(),
      changed_by: 'Shop Admin',
      notes: 'Customer checked device and took delivery.',
    },
  ];

  const deliveries: DeliveryRecord[] = [
    {
      id: 'del-1',
      job_id: 'REP-00003',
      delivery_date: todayStr,
      delivery_time: '12:15',
      delivered_to: 'Bilal Hassan (Customer)',
      delivered_by: 'Ali (Counter Staff)',
      final_payment_collected: 1500,
      delivery_notes: 'Phone charging perfectly with 15W fast charger.',
      created_at: new Date(now.getTime() - 3600000 * 2).toISOString(),
    },
  ];

  return { jobs, payments, history, deliveries, counter: 5 };
};

// Storage Service with localStorage fallback
export const storageService = {
  getSettings(): ShopSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: ShopSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getJobs(): RepairJob[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.JOBS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load jobs', e);
    }
    const seed = getSeedData();
    this.saveJobs(seed.jobs);
    this.savePayments(seed.payments);
    this.saveHistory(seed.history);
    this.saveDeliveries(seed.deliveries);
    this.setNextJobNumber(seed.counter);
    return seed.jobs;
  },

  saveJobs(jobs: RepairJob[]): void {
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
  },

  getPayments(): PaymentTransaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load payments', e);
    }
    return [];
  },

  savePayments(payments: PaymentTransaction[]): void {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  },

  getStatusHistory(): StatusHistory[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load status history', e);
    }
    return [];
  },

  saveHistory(history: StatusHistory[]): void {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  },

  getDeliveries(): DeliveryRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DELIVERIES);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load deliveries', e);
    }
    return [];
  },

  saveDeliveries(deliveries: DeliveryRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.DELIVERIES, JSON.stringify(deliveries));
  },

  getNextJobNumber(): number {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.JOB_COUNTER);
      return val ? parseInt(val, 10) : 1;
    } catch {
      return 1;
    }
  },

  setNextJobNumber(num: number): void {
    localStorage.setItem(STORAGE_KEYS.JOB_COUNTER, num.toString());
  },

  generateJobId(): string {
    const current = this.getNextJobNumber();
    const next = current + 1;
    this.setNextJobNumber(next);
    return `REP-${String(next).padStart(5, '0')}`;
  },

  // Payment helpers
  getPaymentsForJob(jobId: string): PaymentTransaction[] {
    const all = this.getPayments();
    return all.filter((p) => p.job_id === jobId);
  },

  getTotalPaidForJob(jobId: string): number {
    const payments = this.getPaymentsForJob(jobId);
    return payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  },

  getJobPaymentSummary(job: RepairJob) {
    const totalPaid = this.getTotalPaidForJob(job.job_id);
    const balance = Math.max(0, job.repairing_cost - totalPaid);
    let status: PaymentStatus = 'unpaid';
    if (totalPaid >= job.repairing_cost && job.repairing_cost > 0) {
      status = 'fully_paid';
    } else if (totalPaid > 0) {
      status = 'partially_paid';
    }
    return {
      cost: job.repairing_cost,
      paid: totalPaid,
      balance,
      status,
    };
  },

  // Add new job
  addRepairJob(
    jobData: Omit<RepairJob, 'id' | 'created_at' | 'updated_at'>,
    advancePaymentAmount: number = 0,
    paymentMethod: PaymentTransaction['payment_method'] = 'cash',
    paymentNotes: string = 'Advance payment'
  ): RepairJob {
    const jobs = this.getJobs();
    const newJob: RepairJob = {
      ...jobData,
      id: 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    jobs.unshift(newJob);
    this.saveJobs(jobs);

    // Initial status history entry
    const history = this.getStatusHistory();
    history.push({
      id: 'hist_' + Date.now(),
      job_id: newJob.job_id,
      previous_status: 'pending',
      new_status: newJob.repair_status,
      changed_at: new Date().toISOString(),
      changed_by: 'Intake Staff',
      notes: 'Initial job registered.',
    });
    this.saveHistory(history);

    // If advance payment provided
    if (advancePaymentAmount > 0) {
      this.addPayment({
        job_id: newJob.job_id,
        amount: advancePaymentAmount,
        payment_method: paymentMethod,
        payment_date: newJob.received_date,
        payment_time: newJob.received_time,
        notes: paymentNotes || 'Advance payment at reception',
      });
    }

    return newJob;
  },

  // Update existing job
  updateRepairJob(job: RepairJob): void {
    const jobs = this.getJobs();
    const index = jobs.findIndex((j) => j.id === job.id || j.job_id === job.job_id);
    if (index !== -1) {
      jobs[index] = {
        ...job,
        updated_at: new Date().toISOString(),
      };
      this.saveJobs(jobs);
    }
  },

  // Delete job
  deleteRepairJob(jobId: string): void {
    const jobs = this.getJobs().filter((j) => j.job_id !== jobId && j.id !== jobId);
    this.saveJobs(jobs);
    const payments = this.getPayments().filter((p) => p.job_id !== jobId);
    this.savePayments(payments);
    const history = this.getStatusHistory().filter((h) => h.job_id !== jobId);
    this.saveHistory(history);
  },

  // Update job status with audit trail
  updateJobStatus(
    jobId: string,
    newStatus: RepairStatus,
    changedBy: string = 'Technician',
    notes: string = ''
  ): void {
    const jobs = this.getJobs();
    const job = jobs.find((j) => j.job_id === jobId);
    if (!job) return;

    const previousStatus = job.repair_status;
    if (previousStatus === newStatus) return;

    job.repair_status = newStatus;
    job.updated_at = new Date().toISOString();
    this.saveJobs(jobs);

    // Record in audit history
    const history = this.getStatusHistory();
    history.push({
      id: 'hist_' + Date.now(),
      job_id: jobId,
      previous_status: previousStatus,
      new_status: newStatus,
      changed_at: new Date().toISOString(),
      changed_by: changedBy,
      notes: notes || `Status changed from ${previousStatus} to ${newStatus}`,
    });
    this.saveHistory(history);
  },

  // Add a payment transaction
  addPayment(
    paymentData: Omit<PaymentTransaction, 'id' | 'created_at'>
  ): PaymentTransaction {
    const payments = this.getPayments();
    const newPayment: PaymentTransaction = {
      ...paymentData,
      id: 'pay_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      created_at: new Date().toISOString(),
    };
    payments.unshift(newPayment);
    this.savePayments(payments);
    return newPayment;
  },

  // Record delivery
  recordDelivery(
    deliveryData: Omit<DeliveryRecord, 'id' | 'created_at'>,
    finalPaymentAmount: number = 0,
    paymentMethod: PaymentTransaction['payment_method'] = 'cash'
  ): DeliveryRecord {
    const deliveries = this.getDeliveries();
    const newDelivery: DeliveryRecord = {
      ...deliveryData,
      id: 'del_' + Date.now(),
      created_at: new Date().toISOString(),
    };
    deliveries.unshift(newDelivery);
    this.saveDeliveries(deliveries);

    // Update job status to delivered
    this.updateJobStatus(
      deliveryData.job_id,
      'delivered',
      deliveryData.delivered_by,
      deliveryData.delivery_notes || 'Device collected by customer.'
    );

    // If final payment collected
    if (finalPaymentAmount > 0) {
      this.addPayment({
        job_id: deliveryData.job_id,
        amount: finalPaymentAmount,
        payment_method: paymentMethod,
        payment_date: deliveryData.delivery_date,
        payment_time: deliveryData.delivery_time,
        notes: `Final payment upon delivery to ${deliveryData.delivered_to}`,
      });
    }

    return newDelivery;
  },

  // Calculate Dashboard Metrics accurately based on date filter
  getDashboardMetrics(
    filter: DateFilterRange,
    customStartDate?: string,
    customEndDate?: string
  ): DashboardMetrics {
    const jobs = this.getJobs();
    const payments = this.getPayments();

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const yesterdayDate = new Date(now.getTime() - 86400000);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    const startOfWeek = new Date(now);
    const dayOfWeek = now.getDay(); // 0 is Sun
    startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

    const startOfMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonthStartStr = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}-01`;
    const lastMonthEndStr = `${lastMonthEnd.getFullYear()}-${String(lastMonthEnd.getMonth() + 1).padStart(2, '0')}-${String(lastMonthEnd.getDate()).padStart(2, '0')}`;

    const startOfYearStr = `${now.getFullYear()}-01-01`;

    const isDateMatch = (dateStr: string): boolean => {
      if (!dateStr) return false;
      switch (filter) {
        case 'today':
          return dateStr === todayStr;
        case 'yesterday':
          return dateStr === yesterdayStr;
        case 'this_week':
          return dateStr >= startOfWeekStr && dateStr <= todayStr;
        case 'this_month':
          return dateStr >= startOfMonthStr && dateStr <= todayStr;
        case 'last_month':
          return dateStr >= lastMonthStartStr && dateStr <= lastMonthEndStr;
        case 'this_year':
          return dateStr >= startOfYearStr && dateStr <= todayStr;
        case 'custom':
          if (customStartDate && customEndDate) {
            return dateStr >= customStartDate && dateStr <= customEndDate;
          }
          if (customStartDate) return dateStr >= customStartDate;
          if (customEndDate) return dateStr <= customEndDate;
          return true;
        default:
          return true;
      }
    };

    // Filter jobs received in date period
    const filteredJobs = jobs.filter((j) => isDateMatch(j.received_date));

    // Metrics for received jobs in this period:
    const totalReceived = filteredJobs.length;
    const totalRepairingAmount = filteredJobs.reduce((sum, j) => sum + (Number(j.repairing_cost) || 0), 0);

    // Status breakdown across either the filtered jobs or shop's current active pipeline
    // PRD rule:
    // 1. Total Mobiles Received
    // 2. Total Repaired Mobiles: successfully repaired mobile phones
    // 3. Pending Repairs: awaiting repair (Pending, In Progress, Waiting for Parts)
    // 4. Ready for Delivery: repaired mobile phones that have not yet been delivered
    // 5. Total Delivered: returned to customers
    // 6. Total Repairing Amount: total agreed repair charges for registered jobs
    // 7. Total Payments Received: total amount of money collected (calculated from payment transactions in this period!)
    // 8. Total Outstanding Balance: total remaining payments due from customers

    // Count categories without double counting:
    let totalRepaired = 0;
    let pendingRepairs = 0;
    let readyForDelivery = 0;
    let totalDelivered = 0;

    filteredJobs.forEach((j) => {
      if (j.repair_status === 'repaired') {
        totalRepaired++;
      } else if (
        j.repair_status === 'pending' ||
        j.repair_status === 'in_progress' ||
        j.repair_status === 'waiting_for_parts'
      ) {
        pendingRepairs++;
      } else if (j.repair_status === 'ready_for_delivery') {
        readyForDelivery++;
        totalRepaired++; // counted as repaired successfully
      } else if (j.repair_status === 'delivered') {
        totalDelivered++;
        totalRepaired++; // delivered phones were repaired
      }
    });

    // PRD specification: "Important: Daily and monthly payment collections must be calculated using payment transaction dates, not the original repair receiving date."
    const filteredPayments = payments.filter((p) => isDateMatch(p.payment_date));
    const totalPaymentsReceived = filteredPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    // Total outstanding balance across the filtered jobs
    let totalOutstandingBalance = 0;
    filteredJobs.forEach((j) => {
      const paid = this.getTotalPaidForJob(j.job_id);
      const bal = Math.max(0, j.repairing_cost - paid);
      totalOutstandingBalance += bal;
    });

    return {
      totalReceived,
      totalRepaired,
      pendingRepairs,
      readyForDelivery,
      totalDelivered,
      totalRepairingAmount,
      totalPaymentsReceived,
      totalOutstandingBalance,
    };
  },

  // Export all application data to JSON string
  exportBackup(): string {
    const payload = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      settings: this.getSettings(),
      jobs: this.getJobs(),
      payments: this.getPayments(),
      history: this.getStatusHistory(),
      deliveries: this.getDeliveries(),
      job_counter: this.getNextJobNumber(),
    };
    return JSON.stringify(payload, null, 2);
  },

  // Restore application data from JSON
  restoreBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.jobs && Array.isArray(data.jobs)) {
        this.saveJobs(data.jobs);
      }
      if (data.payments && Array.isArray(data.payments)) {
        this.savePayments(data.payments);
      }
      if (data.history && Array.isArray(data.history)) {
        this.saveHistory(data.history);
      }
      if (data.deliveries && Array.isArray(data.deliveries)) {
        this.saveDeliveries(data.deliveries);
      }
      if (data.settings) {
        this.saveSettings(data.settings);
      }
      if (data.job_counter) {
        this.setNextJobNumber(data.job_counter);
      }
      return true;
    } catch (e) {
      console.error('Failed to restore backup', e);
      return false;
    }
  },

  // Reset to demo seed data
  resetToDemo(): void {
    const seed = getSeedData();
    this.saveJobs(seed.jobs);
    this.savePayments(seed.payments);
    this.saveHistory(seed.history);
    this.saveDeliveries(seed.deliveries);
    this.setNextJobNumber(seed.counter);
    this.saveSettings(DEFAULT_SETTINGS);
  },
};
