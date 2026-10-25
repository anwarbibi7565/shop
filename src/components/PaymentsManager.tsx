import React, { useState, useMemo } from 'react';
import {
  ShopSettings,
  PaymentTransaction,
  PaymentMethod,
  RepairJob,
} from '../types';
import { storageService } from '../services/storage';
import { PAYMENT_METHOD_LABELS, TRANSLATIONS } from '../translations';
import {
  DollarSign,
  Search,
  Filter,
  Plus,
  Calendar,
  Clock,
  ArrowUpRight,
  Wallet,
  Building,
  Smartphone,
  CheckCircle2,
  X,
} from 'lucide-react';

interface PaymentsManagerProps {
  settings: ShopSettings;
  onSelectJob: (job: RepairJob) => void;
}

export const PaymentsManager: React.FC<PaymentsManagerProps> = ({
  settings,
  onSelectJob,
}) => {
  const isUrdu = settings.selected_language === 'ur';
  const payments = storageService.getPayments();
  const jobs = storageService.getJobs();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  // Quick Add Payment Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Find jobs with remaining balance
  const unpaidJobs = useMemo(() => {
    return jobs.filter((j) => {
      const summary = storageService.getJobPaymentSummary(j);
      return summary.balance > 0;
    });
  }, [jobs]);

  const filteredPayments = useMemo(() => {
    let result = [...payments];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.job_id.toLowerCase().includes(q) ||
          (p.notes && p.notes.toLowerCase().includes(q))
      );
    }

    if (methodFilter !== 'all') {
      result = result.filter((p) => p.payment_method === methodFilter);
    }

    // Newest first
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return result;
  }, [payments, searchQuery, methodFilter]);

  // Aggregate statistics
  const totalCollected = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const cashCollected = payments
    .filter((p) => p.payment_method === 'cash')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const digitalCollected = totalCollected - cashCollected;

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) {
      setErrorMsg('Please select a repair job.');
      return;
    }
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setErrorMsg('Please enter a valid payment amount.');
      return;
    }

    const job = jobs.find((j) => j.job_id === selectedJobId);
    if (job) {
      const summary = storageService.getJobPaymentSummary(job);
      if (amt > summary.balance) {
        setErrorMsg(`Payment cannot exceed outstanding balance of ${settings.currency_symbol} ${summary.balance}`);
        return;
      }
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    storageService.addPayment({
      job_id: selectedJobId,
      amount: amt,
      payment_method: method,
      payment_date: todayStr,
      payment_time: timeStr,
      notes: notes.trim() || 'Payment received',
    });

    setShowAddModal(false);
    setSelectedJobId('');
    setAmount('');
    setNotes('');
    setErrorMsg('');
  };

  const getMethodBadge = (m: PaymentMethod) => {
    switch (m) {
      case 'cash':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            Cash
          </span>
        );
      case 'jazzcash':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
            JazzCash
          </span>
        );
      case 'easypaisa':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            Easypaisa
          </span>
        );
      case 'bank_transfer':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            Bank Transfer
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
            Other
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isUrdu ? 'ادائیگیاں اور مالی کھاتہ' : 'Payments & Transactions'}
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            {isUrdu
              ? 'تمام ایڈوانس و بقایا رقوم کی تفصیل اور نیا اندراج'
              : 'Complete ledger of all repair deposits, installments, and collections'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2C3E50] hover:bg-slate-800 text-white font-medium rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>{isUrdu ? 'نئی رقم وصول کریں' : 'Record Payment'}</span>
        </button>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'کل موصولہ رقم' : 'Total Collected'}
            </span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold font-tabular text-slate-900 dark:text-white mt-1">
            {settings.currency_symbol} {totalCollected.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {payments.length} total transactions
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'نقد (کیش) وصولی' : 'Cash Collected'}
            </span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-tabular text-emerald-700 dark:text-emerald-400 mt-1">
            {settings.currency_symbol} {cashCollected.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Physical drawer cash</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'آن لائن / ڈیجیٹل وصولی' : 'Digital & Mobile Wallets'}
            </span>
            <Smartphone className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold font-tabular text-indigo-600 dark:text-indigo-400 mt-1">
            {settings.currency_symbol} {digitalCollected.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            JazzCash, Easypaisa, Bank
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Job ID or notes..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Method:</span>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer"
          >
            <option value="all">All Methods</option>
            <option value="cash">Cash</option>
            <option value="jazzcash">JazzCash</option>
            <option value="easypaisa">Easypaisa</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Payment ID / Date</th>
                <th className="py-3 px-4">Job ID</th>
                <th className="py-3 px-4">Customer & Device</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPayments.map((p) => {
                const job = jobs.find((j) => j.job_id === p.job_id);
                return (
                  <tr
                    key={p.id}
                    onClick={() => job && onSelectJob(job)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-400 text-[10px]">{p.id}</div>
                      <div className="font-tabular text-slate-700 dark:text-slate-300 mt-0.5">
                        {p.payment_date} {p.payment_time}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-bold font-tabular text-[#2C3E50] dark:text-blue-400">
                      {p.job_id}
                    </td>

                    <td className="py-3 px-4">
                      {job ? (
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {job.customer_name}
                          </div>
                          <div className="text-slate-400 text-[11px]">
                            {job.mobile_brand} {job.mobile_model}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Job record</span>
                      )}
                    </td>

                    <td className="py-3 px-4">{getMethodBadge(p.payment_method)}</td>

                    <td className="py-3 px-4 text-slate-500 max-w-[200px] truncate">
                      {p.notes || '—'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="font-bold font-tabular text-sm text-emerald-600 dark:text-emerald-400">
                        {settings.currency_symbol} {p.amount.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 text-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isUrdu ? 'نئی رقم وصولی درج کریں' : 'Record Customer Payment'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-3 p-2 bg-rose-50 text-rose-700 rounded-lg text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Select Pending Repair Job *
                </label>
                <select
                  required
                  value={selectedJobId}
                  onChange={(e) => {
                    setSelectedJobId(e.target.value);
                    const found = jobs.find((j) => j.job_id === e.target.value);
                    if (found) {
                      const s = storageService.getJobPaymentSummary(found);
                      setAmount(s.balance);
                    }
                  }}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer text-xs"
                >
                  <option value="">-- Choose a job with outstanding balance --</option>
                  {unpaidJobs.map((j) => {
                    const s = storageService.getJobPaymentSummary(j);
                    return (
                      <option key={j.id} value={j.job_id}>
                        {j.job_id} - {j.customer_name} ({j.mobile_brand} {j.mobile_model}) · Balance: {settings.currency_symbol} {s.balance}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Amount ({settings.currency_symbol}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="e.g. 2000"
                  className="w-full p-2 font-bold font-tabular bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                >
                  <option value="cash">Cash</option>
                  <option value="jazzcash">JazzCash</option>
                  <option value="easypaisa">Easypaisa</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Balance cleared on pickup"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
