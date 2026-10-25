import React, { useState, useMemo } from 'react';
import {
  RepairJob,
  ShopSettings,
  RepairStatus,
  PaymentStatus,
} from '../types';
import { storageService } from '../services/storage';
import { STATUS_LABELS, TRANSLATIONS } from '../translations';
import {
  Search,
  Filter,
  ArrowUpDown,
  Smartphone,
  Calendar,
  Clock,
  Printer,
  PackageCheck,
  ChevronRight,
  Plus,
  AlertCircle,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';

interface RepairHistoryProps {
  settings: ShopSettings;
  onSelectJob: (job: RepairJob) => void;
  onOpenReceipt: (job: RepairJob) => void;
  onOpenDelivery: (job: RepairJob) => void;
  onNavigateNewJob: () => void;
  initialFilter?: string;
}

export const RepairHistory: React.FC<RepairHistoryProps> = ({
  settings,
  onSelectJob,
  onOpenReceipt,
  onOpenDelivery,
  onNavigateNewJob,
  initialFilter,
}) => {
  const isUrdu = settings.selected_language === 'ur';
  const jobs = storageService.getJobs();

  // Search, Filter, Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter || 'all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<
    'newest' | 'oldest' | 'cost_high' | 'cost_low'
  >('newest');

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    // Search query: customer name, mobile, model, imei, job_id
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (j) =>
          j.job_id.toLowerCase().includes(q) ||
          j.customer_name.toLowerCase().includes(q) ||
          j.mobile_number.includes(q) ||
          (j.additional_number && j.additional_number.includes(q)) ||
          j.mobile_model.toLowerCase().includes(q) ||
          j.mobile_brand.toLowerCase().includes(q) ||
          (j.imei_number && j.imei_number.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((j) => j.repair_status === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      result = result.filter((j) => {
        const summary = storageService.getJobPaymentSummary(j);
        return summary.status === paymentFilter;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === 'cost_high') {
        return (b.repairing_cost || 0) - (a.repairing_cost || 0);
      }
      if (sortBy === 'cost_low') {
        return (a.repairing_cost || 0) - (b.repairing_cost || 0);
      }
      return 0;
    });

    return result;
  }, [jobs, searchQuery, statusFilter, paymentFilter, sortBy]);

  const formattedDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        if (settings.date_format === 'DD/MM/YYYY') {
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        if (settings.date_format === 'MM/DD/YYYY') {
          return `${parts[1]}/${parts[2]}/${parts[0]}`;
        }
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: RepairStatus) => {
    const label = STATUS_LABELS[status]?.[settings.selected_language] || status;
    switch (status) {
      case 'repaired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            {label}
          </span>
        );
      case 'ready_for_delivery':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            {label}
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
            {label}
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            {label}
          </span>
        );
      case 'waiting_for_parts':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
            {label}
          </span>
        );
      case 'unrepairable':
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
            {label}
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300">
            {label}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-16">
      {/* Top Header & New Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isUrdu ? 'مرمت کی مکمل تفصیلات' : 'Repairing History'}
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            {isUrdu
              ? `کل رجسٹرڈ جابز: ${jobs.length}`
              : `Showing ${filteredJobs.length} of ${jobs.length} total registered jobs`}
          </p>
        </div>

        <button
          onClick={onNavigateNewJob}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2C3E50] hover:bg-slate-800 text-white font-medium rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>{isUrdu ? 'نیا کام درج کریں' : 'Add New Job'}</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-5 shadow-xs space-y-3">
        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isUrdu
                ? 'گاہک کا نام، موبائل نمبر، ماڈل، آئی ایم ای آئی یا جاب نمبر تلاش کریں...'
                : 'Search by Customer Name, Mobile Number, Model, IMEI, or Job ID...'
            }
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter controls row */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Status filter tabs */}
          <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-full">
            <span className="text-slate-400 font-medium whitespace-nowrap mr-1">
              {isUrdu ? 'حالت:' : 'Status:'}
            </span>
            {[
              { id: 'all', label: isUrdu ? 'تمام' : 'All' },
              { id: 'pending', label: isUrdu ? 'زیر التواء' : 'Pending' },
              { id: 'in_progress', label: isUrdu ? 'کام جاری' : 'In Progress' },
              { id: 'repaired', label: isUrdu ? 'مرمت شدہ' : 'Repaired' },
              { id: 'ready_for_delivery', label: isUrdu ? 'تیار' : 'Ready' },
              { id: 'delivered', label: isUrdu ? 'واپس شدہ' : 'Delivered' },
              { id: 'unrepairable', label: isUrdu ? 'ناقابل مرمت' : 'Unrepairable' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-[#2C3E50] text-white font-medium shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Payment filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <option value="all">{isUrdu ? 'تمام ادائیگیاں' : 'All Payments'}</option>
              <option value="unpaid">{isUrdu ? 'غیر ادا شدہ (Unpaid)' : 'Unpaid'}</option>
              <option value="partially_paid">{isUrdu ? 'جزوی ادا شدہ' : 'Partially Paid'}</option>
              <option value="fully_paid">{isUrdu ? 'مکمل ادا شدہ' : 'Fully Paid'}</option>
            </select>

            {/* Sort selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <option value="newest">{isUrdu ? 'تازہ ترین پہلے' : 'Newest First'}</option>
              <option value="oldest">{isUrdu ? 'پرانے پہلے' : 'Oldest First'}</option>
              <option value="cost_high">{isUrdu ? 'زیادہ چارجز پہلے' : 'Highest Cost'}</option>
              <option value="cost_low">{isUrdu ? 'کم چارجز پہلے' : 'Lowest Cost'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs List / Table */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <Smartphone className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            {isUrdu ? 'کوئی جاب ریکارڈ نہیں ملا' : 'No Repair Jobs Found'}
          </h3>
          <p className="text-slate-500 text-xs mt-1">
            {isUrdu
              ? 'تلاش یا فلٹر تبدیل کر کے دوبارہ دیکھیں'
              : 'Try adjusting your search criteria or register a new customer repair.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => {
            const summary = storageService.getJobPaymentSummary(job);
            return (
              <div
                key={job.id}
                onClick={() => onSelectJob(job)}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-xs cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left zone: Job ID, Customer, Device */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                    <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-tabular text-sm text-[#2C3E50] dark:text-blue-300">
                        {job.job_id}
                      </span>
                      {getStatusBadge(job.repair_status)}
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                      {job.mobile_brand} {job.mobile_model}
                    </h4>

                    <p className="text-slate-500 text-xs mt-0.5 flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {job.customer_name}
                      </span>
                      <span>·</span>
                      <span className="font-tabular">{job.mobile_number}</span>
                      <span>·</span>
                      <span className="truncate max-w-[220px] text-slate-400">
                        {job.device_problem}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Middle zone: Date & Time */}
                <div className="hidden lg:flex flex-col text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-tabular">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formattedDate(job.received_date)}</span>
                  </span>
                  <span className="flex items-center gap-1 font-tabular text-slate-400 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{job.received_time}</span>
                  </span>
                </div>

                {/* Right zone: Finances & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  {/* Financial numbers */}
                  <div className="text-right text-xs">
                    <div className="text-slate-500">
                      <span>Total: </span>
                      <span className="font-bold font-tabular text-slate-900 dark:text-white">
                        {settings.currency_symbol} {job.repairing_cost.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-0.5">
                      {summary.balance > 0 ? (
                        <span className="font-bold font-tabular text-amber-600 dark:text-amber-400">
                          Balance: {settings.currency_symbol} {summary.balance.toLocaleString()}
                        </span>
                      ) : (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Fully Paid</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onOpenReceipt(job)}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition"
                      title="Receipt"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    {job.repair_status !== 'delivered' && (
                      <button
                        onClick={() => onOpenDelivery(job)}
                        className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 transition"
                        title="Deliver"
                      >
                        <PackageCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onSelectJob(job)}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
