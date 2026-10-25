import React, { useState, useMemo } from 'react';
import { ShopSettings, RepairJob, PaymentTransaction } from '../types';
import { storageService } from '../services/storage';
import { TRANSLATIONS } from '../translations';
import {
  FileText,
  Download,
  Printer,
  Share2,
  Calendar,
  CheckCircle2,
  Clock,
  PackageCheck,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

interface ReportsModuleProps {
  settings: ShopSettings;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({ settings }) => {
  const isUrdu = settings.selected_language === 'ur';
  const jobs = storageService.getJobs();
  const payments = storageService.getPayments();

  const [reportType, setReportType] = useState<'daily' | 'monthly'>('daily');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedMonth, setSelectedMonth] = useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  );

  // Compute Daily Report metrics for selectedDate
  const dailyReport = useMemo(() => {
    const receivedJobs = jobs.filter((j) => j.received_date === selectedDate);
    const repairedJobs = jobs.filter(
      (j) =>
        (j.repair_status === 'repaired' ||
          j.repair_status === 'ready_for_delivery' ||
          j.repair_status === 'delivered') &&
        j.received_date === selectedDate
    );
    const deliveredJobs = jobs.filter(
      (j) => j.repair_status === 'delivered' && j.received_date === selectedDate
    );

    // Current pending backlog
    const pendingRepairs = jobs.filter(
      (j) =>
        j.repair_status === 'pending' ||
        j.repair_status === 'in_progress' ||
        j.repair_status === 'waiting_for_parts'
    ).length;

    // Payments collected ON this specific date
    const dayPayments = payments.filter((p) => p.payment_date === selectedDate);
    const paymentsReceivedToday = dayPayments.reduce(
      (sum, p) => sum + (Number(p.amount) || 0),
      0
    );

    // Outstanding balance on received jobs
    const outstandingBalance = receivedJobs.reduce((sum, j) => {
      const p = storageService.getJobPaymentSummary(j);
      return sum + p.balance;
    }, 0);

    return {
      receivedCount: receivedJobs.length,
      repairedCount: repairedJobs.length,
      deliveredCount: deliveredJobs.length,
      pendingRepairs,
      paymentsReceivedToday,
      outstandingBalance,
      receivedJobs,
      dayPayments,
    };
  }, [jobs, payments, selectedDate]);

  // Compute Monthly Report metrics for selectedMonth (YYYY-MM)
  const monthlyReport = useMemo(() => {
    const monthPrefix = selectedMonth; // e.g. "2026-10"
    const monthJobs = jobs.filter((j) => j.received_date.startsWith(monthPrefix));
    const monthRepaired = monthJobs.filter(
      (j) =>
        j.repair_status === 'repaired' ||
        j.repair_status === 'ready_for_delivery' ||
        j.repair_status === 'delivered'
    );
    const monthDelivered = monthJobs.filter((j) => j.repair_status === 'delivered');

    const totalCharges = monthJobs.reduce(
      (sum, j) => sum + (Number(j.repairing_cost) || 0),
      0
    );

    // Payments collected during this month
    const monthPayments = payments.filter((p) =>
      p.payment_date.startsWith(monthPrefix)
    );
    const paymentsCollected = monthPayments.reduce(
      (sum, p) => sum + (Number(p.amount) || 0),
      0
    );

    const outstandingPayments = monthJobs.reduce((sum, j) => {
      const p = storageService.getJobPaymentSummary(j);
      return sum + p.balance;
    }, 0);

    return {
      receivedCount: monthJobs.length,
      repairedCount: monthRepaired.length,
      deliveredCount: monthDelivered.length,
      totalCharges,
      paymentsCollected,
      outstandingPayments,
      monthJobs,
      monthPayments,
    };
  }, [jobs, payments, selectedMonth]);

  // Export CSV function
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (reportType === 'daily') {
      csvContent += 'Job ID,Customer Name,Mobile,Brand,Model,Problem,Status,Cost,Paid,Balance,Date\r\n';
      dailyReport.receivedJobs.forEach((j) => {
        const s = storageService.getJobPaymentSummary(j);
        csvContent += `"${j.job_id}","${j.customer_name}","${j.mobile_number}","${j.mobile_brand}","${j.mobile_model}","${j.device_problem.replace(/"/g, '""')}","${j.repair_status}","${j.repairing_cost}","${s.paid}","${s.balance}","${j.received_date}"\r\n`;
      });
    } else {
      csvContent += 'Job ID,Customer Name,Mobile,Brand,Model,Problem,Status,Cost,Paid,Balance,Date\r\n';
      monthlyReport.monthJobs.forEach((j) => {
        const s = storageService.getJobPaymentSummary(j);
        csvContent += `"${j.job_id}","${j.customer_name}","${j.mobile_number}","${j.mobile_brand}","${j.mobile_model}","${j.device_problem.replace(/"/g, '""')}","${j.repair_status}","${j.repairing_cost}","${s.paid}","${s.balance}","${j.received_date}"\r\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Repair_Report_${reportType}_${reportType === 'daily' ? selectedDate : selectedMonth}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const cur = settings.currency_symbol;
    let message = '';
    if (reportType === 'daily') {
      message = `*${settings.shop_name}* - Daily Report (${selectedDate})
-----------------------------
Mobiles Received Today: ${dailyReport.receivedCount}
Mobiles Repaired: ${dailyReport.repairedCount}
Mobiles Delivered: ${dailyReport.deliveredCount}
Pending Backlog: ${dailyReport.pendingRepairs}
-----------------------------
Total Payments Received Today: ${cur} ${dailyReport.paymentsReceivedToday.toLocaleString()}
Total Outstanding Balance: ${cur} ${dailyReport.outstandingBalance.toLocaleString()}
-----------------------------
Generated by Mobile Repair Shop Manager`;
    } else {
      message = `*${settings.shop_name}* - Monthly Report (${selectedMonth})
-----------------------------
Mobiles Received This Month: ${monthlyReport.receivedCount}
Mobiles Repaired: ${monthlyReport.repairedCount}
Mobiles Delivered: ${monthlyReport.deliveredCount}
-----------------------------
Total Repairing Charges: ${cur} ${monthlyReport.totalCharges.toLocaleString()}
Total Payments Collected: ${cur} ${monthlyReport.paymentsCollected.toLocaleString()}
Total Outstanding Payments: ${cur} ${monthlyReport.outstandingPayments.toLocaleString()}
-----------------------------
Generated by Mobile Repair Shop Manager`;
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isUrdu ? 'روزانہ و ماہانہ مالی رپورٹس' : 'Daily & Monthly Reports'}
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            {isUrdu
              ? 'موبائلز کی آمد، مرمت، حوالگی اور وصول شدہ رقوم کی مستند رپورٹس'
              : 'Accurate business analytics computed by transaction dates and repair lifecycle'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-medium transition shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>{isUrdu ? 'CSV ڈاؤنلوڈ' : 'Export CSV'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#2C3E50] hover:bg-slate-800 text-white rounded-xl text-xs font-medium transition shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>{isUrdu ? 'پرنٹ کریں' : 'Print'}</span>
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium transition shadow-xs"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Report Switcher & Date Picker */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReportType('daily')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              reportType === 'daily'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {isUrdu ? 'روزانہ رپورٹ (Daily)' : 'Daily Report'}
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              reportType === 'monthly'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {isUrdu ? 'ماہانہ رپورٹ (Monthly)' : 'Monthly Report'}
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {reportType === 'daily' ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Select Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-tabular"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Select Month:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-tabular"
              />
            </div>
          )}
        </div>
      </div>

      {/* REPORT CONTENT VIEW (PRINTABLE) */}
      <div className="printable-area space-y-6">
        {/* Printable Report Header */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {settings.shop_name}
              </h2>
              <p className="text-xs text-slate-500">
                {settings.shop_address} · {settings.shop_phone}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
                {reportType === 'daily' ? 'Daily Operations Report' : 'Monthly Financial Report'}
              </span>
              <span className="font-bold font-tabular text-sm text-slate-800 dark:text-slate-200">
                Period: {reportType === 'daily' ? selectedDate : selectedMonth}
              </span>
            </div>
          </div>

          {/* Metric Cards Grid */}
          {reportType === 'daily' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Received Today
                </span>
                <p className="text-xl font-bold font-tabular text-slate-900 dark:text-white mt-1">
                  {dailyReport.receivedCount}
                </p>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] text-emerald-600 uppercase tracking-wider block">
                  Repaired Today
                </span>
                <p className="text-xl font-bold font-tabular text-emerald-700 dark:text-emerald-400 mt-1">
                  {dailyReport.repairedCount}
                </p>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                <span className="text-[10px] text-blue-600 uppercase tracking-wider block">
                  Delivered Today
                </span>
                <p className="text-xl font-bold font-tabular text-blue-700 dark:text-blue-400 mt-1">
                  {dailyReport.deliveredCount}
                </p>
              </div>

              <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-xl border border-orange-200 dark:border-orange-800">
                <span className="text-[10px] text-orange-600 uppercase tracking-wider block">
                  Pending Backlog
                </span>
                <p className="text-xl font-bold font-tabular text-orange-700 dark:text-orange-400 mt-1">
                  {dailyReport.pendingRepairs}
                </p>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] text-emerald-600 uppercase tracking-wider block">
                  Payments Collected
                </span>
                <p className="text-lg font-bold font-tabular text-emerald-700 dark:text-emerald-400 mt-1">
                  {settings.currency_symbol} {dailyReport.paymentsReceivedToday.toLocaleString()}
                </p>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
                <span className="text-[10px] text-amber-600 uppercase tracking-wider block">
                  Outstanding Balance
                </span>
                <p className="text-lg font-bold font-tabular text-amber-700 dark:text-amber-400 mt-1">
                  {settings.currency_symbol} {dailyReport.outstandingBalance.toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Mobiles Received
                </span>
                <p className="text-xl font-bold font-tabular text-slate-900 dark:text-white mt-1">
                  {monthlyReport.receivedCount}
                </p>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] text-emerald-600 uppercase tracking-wider block">
                  Total Repaired
                </span>
                <p className="text-xl font-bold font-tabular text-emerald-700 dark:text-emerald-400 mt-1">
                  {monthlyReport.repairedCount}
                </p>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                <span className="text-[10px] text-blue-600 uppercase tracking-wider block">
                  Delivered Mobiles
                </span>
                <p className="text-xl font-bold font-tabular text-blue-700 dark:text-blue-400 mt-1">
                  {monthlyReport.deliveredCount}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Repairing Charges
                </span>
                <p className="text-lg font-bold font-tabular text-slate-900 dark:text-white mt-1">
                  {settings.currency_symbol} {monthlyReport.totalCharges.toLocaleString()}
                </p>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] text-emerald-600 uppercase tracking-wider block">
                  Collected Payments
                </span>
                <p className="text-lg font-bold font-tabular text-emerald-700 dark:text-emerald-400 mt-1">
                  {settings.currency_symbol} {monthlyReport.paymentsCollected.toLocaleString()}
                </p>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
                <span className="text-[10px] text-amber-600 uppercase tracking-wider block">
                  Outstanding Due
                </span>
                <p className="text-lg font-bold font-tabular text-amber-700 dark:text-amber-400 mt-1">
                  {settings.currency_symbol} {monthlyReport.outstandingPayments.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Breakdown Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
            {reportType === 'daily'
              ? `Repair Jobs Registered on ${selectedDate}`
              : `Repair Jobs for ${selectedMonth}`}
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Job ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Device & Problem</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Cost</th>
                  <th className="py-2.5 px-3 text-right">Paid</th>
                  <th className="py-2.5 px-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(reportType === 'daily'
                  ? dailyReport.receivedJobs
                  : monthlyReport.monthJobs
                ).map((j) => {
                  const s = storageService.getJobPaymentSummary(j);
                  return (
                    <tr key={j.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold font-tabular text-[#2C3E50] dark:text-blue-400">
                        {j.job_id}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {j.customer_name}
                        </span>{' '}
                        <span className="text-slate-400 text-[11px] font-tabular">
                          ({j.mobile_number})
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {j.mobile_brand} {j.mobile_model} -{' '}
                        <span className="text-slate-500 truncate max-w-[150px] inline-block align-bottom">
                          {j.device_problem}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="capitalize">{j.repair_status.replace(/_/g, ' ')}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-tabular">
                        {settings.currency_symbol} {j.repairing_cost.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-tabular text-emerald-600">
                        {settings.currency_symbol} {s.paid.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-tabular font-semibold">
                        <span className={s.balance > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                          {settings.currency_symbol} {s.balance.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
