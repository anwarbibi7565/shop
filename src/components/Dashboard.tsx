import React, { useState } from 'react';
import {
  ShopSettings,
  DateFilterRange,
  RepairJob,
  RepairStatus,
} from '../types';
import { storageService } from '../services/storage';
import { STATUS_LABELS, TRANSLATIONS } from '../translations';
import {
  Smartphone,
  CheckCircle2,
  Clock,
  PackageCheck,
  Truck,
  DollarSign,
  Wallet,
  AlertCircle,
  Plus,
  Calendar,
  ChevronRight,
  TrendingUp,
  Printer,
  ArrowUpRight,
  History,
} from 'lucide-react';

interface DashboardProps {
  settings: ShopSettings;
  onNavigateNewJob: () => void;
  onNavigateHistoryWithFilter: (filterKey: string) => void;
  onNavigatePayments: () => void;
  onSelectJob: (job: RepairJob) => void;
  onOpenReceipt: (job: RepairJob) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  settings,
  onNavigateNewJob,
  onNavigateHistoryWithFilter,
  onNavigatePayments,
  onSelectJob,
  onOpenReceipt,
}) => {
  const isUrdu = settings.selected_language === 'ur';
  const [dateFilter, setDateFilter] = useState<DateFilterRange>('today');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Calculate metrics based on storage
  const metrics = storageService.getDashboardMetrics(
    dateFilter,
    customStart,
    customEnd
  );

  const allJobs = storageService.getJobs();
  // Recent 5 jobs
  const recentJobs = [...allJobs]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

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

  const DATE_TABS: { id: DateFilterRange; labelEn: string; labelUr: string }[] = [
    { id: 'today', labelEn: 'Today', labelUr: 'آج' },
    { id: 'yesterday', labelEn: 'Yesterday', labelUr: 'گزشتہ کل' },
    { id: 'this_week', labelEn: 'This Week', labelUr: 'اس ہفتے' },
    { id: 'this_month', labelEn: 'This Month', labelUr: 'اس ماہ' },
    { id: 'last_month', labelEn: 'Last Month', labelUr: 'گزشتہ ماہ' },
    { id: 'this_year', labelEn: 'This Year', labelUr: 'اس سال' },
    { id: 'custom', labelEn: 'Custom', labelUr: 'مخصوص تاریخ' },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-16">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {settings.shop_logo ? (
            <img
              src={settings.shop_logo}
              alt={settings.shop_name}
              className="w-12 h-12 object-contain rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-xs"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-[#2C3E50] text-white flex items-center justify-center font-bold text-lg">
              {settings.shop_name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {settings.shop_name}
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span>{settings.shop_phone}</span>
              <span>·</span>
              <span className="truncate max-w-[280px]">{settings.shop_address}</span>
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateNewJob}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2C3E50] hover:bg-slate-800 text-white font-semibold rounded-xl shadow-xs transition active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>{isUrdu ? 'نیا موبائل موصول کریں' : 'New Repair Job'}</span>
        </button>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2.5 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full">
          {DATE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDateFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                dateFilter === tab.id
                  ? 'bg-slate-900 text-white font-medium shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {isUrdu ? tab.labelUr : tab.labelEn}
            </button>
          ))}
        </div>

        {dateFilter === 'custom' && (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-tabular"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-tabular"
            />
          </div>
        )}
      </div>

      {/* 8 DASHBOARD METRIC CARDS (All Clickable as per PRD Section 2) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-8">
        {/* 1. Total Mobiles Received */}
        <div
          onClick={() => onNavigateHistoryWithFilter('all')}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:border-blue-400 dark:hover:border-blue-600 transition shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'کل موصولہ موبائلز' : 'Mobiles Received'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-tabular text-slate-900 dark:text-white mt-1">
            {metrics.totalReceived}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>Registered in period</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:text-blue-600 transition-colors" />
          </div>
        </div>

        {/* 2. Total Repaired Mobiles */}
        <div
          onClick={() => onNavigateHistoryWithFilter('repaired')}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:border-emerald-400 dark:hover:border-emerald-600 transition shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'کل مرمت شدہ' : 'Repaired Mobiles'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-tabular text-emerald-600 dark:text-emerald-400 mt-1">
            {metrics.totalRepaired}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>Successfully fixed</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:text-emerald-600 transition-colors" />
          </div>
        </div>

        {/* 3. Pending Repairs */}
        <div
          onClick={() => onNavigateHistoryWithFilter('pending')}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:border-orange-400 dark:hover:border-orange-600 transition shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'زیر التواء کام' : 'Pending Repairs'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/50 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-tabular text-orange-600 dark:text-orange-400 mt-1">
            {metrics.pendingRepairs}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>Pending & In progress</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:text-orange-600 transition-colors" />
          </div>
        </div>

        {/* 4. Ready for Delivery */}
        <div
          onClick={() => onNavigateHistoryWithFilter('ready_for_delivery')}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:border-indigo-400 dark:hover:border-indigo-600 transition shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'واپسی کیلئے تیار' : 'Ready for Delivery'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-tabular text-indigo-600 dark:text-indigo-400 mt-1">
            {metrics.readyForDelivery}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>Awaiting customer pickup</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:text-indigo-600 transition-colors" />
          </div>
        </div>

        {/* 5. Total Delivered */}
        <div
          onClick={() => onNavigateHistoryWithFilter('delivered')}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:border-slate-400 dark:hover:border-slate-600 transition shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'گاہک کو واپس شدہ' : 'Total Delivered'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-tabular text-slate-800 dark:text-slate-200 mt-1">
            {metrics.totalDelivered}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>Returned to customers</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:text-slate-800 transition-colors" />
          </div>
        </div>

        {/* 6. Total Repairing Amount */}
        <div
          onClick={() => onNavigateHistoryWithFilter('all')}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:border-blue-400 dark:hover:border-blue-600 transition shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'کل متوقع رقم' : 'Total Repair Amount'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-tabular text-slate-900 dark:text-white mt-1">
            {settings.currency_symbol} {metrics.totalRepairingAmount.toLocaleString()}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>Total agreed charges</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:text-blue-600 transition-colors" />
          </div>
        </div>

        {/* 7. Total Payments Received */}
        <div
          onClick={onNavigatePayments}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:border-emerald-400 dark:hover:border-emerald-600 transition shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'کل موصولہ رقم' : 'Payments Collected'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-tabular text-emerald-600 dark:text-emerald-400 mt-1">
            {settings.currency_symbol} {metrics.totalPaymentsReceived.toLocaleString()}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>By payment dates</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:text-emerald-600 transition-colors" />
          </div>
        </div>

        {/* 8. Total Outstanding Balance */}
        <div
          onClick={() => onNavigateHistoryWithFilter('unpaid')}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:border-amber-400 dark:hover:border-amber-600 transition shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'کل بقایا رقم' : 'Outstanding Balance'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-tabular text-amber-600 dark:text-amber-400 mt-1">
            {settings.currency_symbol} {metrics.totalOutstandingBalance.toLocaleString()}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>Remaining receivable</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:text-amber-600 transition-colors" />
          </div>
        </div>
      </div>

      {/* RECENT REPAIR JOBS SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              {isUrdu ? 'حالیہ مرمتی کام' : 'Recent Repair Jobs'}
            </h2>
            <p className="text-xs text-slate-500">
              {isUrdu ? 'تازہ ترین موصول شدہ فونز' : 'Latest mobile repair intakes and statuses'}
            </p>
          </div>

          <button
            onClick={() => onNavigateHistoryWithFilter('all')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
          >
            <span>{isUrdu ? 'تمام ریکارڈز دیکھیں' : 'View All Jobs'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recentJobs.map((job) => {
            const summary = storageService.getJobPaymentSummary(job);
            return (
              <div
                key={job.id}
                onClick={() => onSelectJob(job)}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 px-2 rounded-xl transition cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-blue-600 shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-tabular text-xs text-[#2C3E50] dark:text-blue-300">
                        {job.job_id}
                      </span>
                      <span className="font-semibold text-xs text-slate-900 dark:text-white">
                        {job.mobile_brand} {job.mobile_model}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      <span>{job.customer_name}</span>
                      <span className="mx-1">·</span>
                      <span className="font-tabular">{job.mobile_number}</span>
                      <span className="mx-1">·</span>
                      <span className="text-slate-400">{job.device_problem}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 text-xs">
                  <div className="text-right">
                    <div className="font-tabular font-bold text-slate-900 dark:text-white">
                      {settings.currency_symbol} {job.repairing_cost.toLocaleString()}
                    </div>
                    <div className="text-[11px]">
                      {summary.balance > 0 ? (
                        <span className="text-amber-600 font-tabular font-semibold">
                          Due: {settings.currency_symbol} {summary.balance.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">Fully Paid</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onOpenReceipt(job)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition"
                      title="Receipt"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onSelectJob(job)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
