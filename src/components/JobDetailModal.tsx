import React, { useState } from 'react';
import {
  RepairJob,
  ShopSettings,
  RepairStatus,
  PaymentMethod,
  PaymentTransaction,
  StatusHistory,
} from '../types';
import { storageService } from '../services/storage';
import { STATUS_LABELS, PAYMENT_METHOD_LABELS, TRANSLATIONS } from '../translations';
import {
  X,
  Smartphone,
  User,
  Phone,
  Calendar,
  Clock,
  Printer,
  Share2,
  DollarSign,
  PackageCheck,
  History,
  Plus,
  Trash2,
  Edit2,
  Check,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface JobDetailModalProps {
  job: RepairJob;
  settings: ShopSettings;
  onClose: () => void;
  onUpdated: () => void;
  onOpenReceipt: () => void;
  onOpenDelivery: () => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  settings,
  onClose,
  onUpdated,
  onOpenReceipt,
  onOpenDelivery,
}) => {
  const isUrdu = settings.selected_language === 'ur';

  // Local state for adding payment
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentNotes, setPaymentNotes] = useState('Installment payment');

  // Status update
  const [selectedStatus, setSelectedStatus] = useState<RepairStatus>(job.repair_status);
  const [statusNote, setStatusNote] = useState('');
  const [technicianName, setTechnicianName] = useState('Technician');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editProblem, setEditProblem] = useState(job.device_problem);
  const [editCost, setEditCost] = useState(job.repairing_cost);
  const [editExpectedDate, setEditExpectedDate] = useState(job.expected_delivery_date || '');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const payments = storageService.getPaymentsForJob(job.job_id);
  const historyList = storageService
    .getStatusHistory()
    .filter((h) => h.job_id === job.job_id)
    .sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());

  const summary = storageService.getJobPaymentSummary(job);

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStatus === job.repair_status) return;

    if (selectedStatus === 'delivered') {
      onOpenDelivery();
      return;
    }

    setIsUpdatingStatus(true);
    storageService.updateJobStatus(
      job.job_id,
      selectedStatus,
      technicianName.trim() || 'Staff',
      statusNote.trim()
    );
    setStatusNote('');
    setIsUpdatingStatus(false);
    onUpdated();
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(paymentAmount);
    if (!amt || amt <= 0) return;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    storageService.addPayment({
      job_id: job.job_id,
      amount: amt,
      payment_method: paymentMethod,
      payment_date: todayStr,
      payment_time: timeStr,
      notes: paymentNotes.trim(),
    });

    setPaymentAmount('');
    setShowAddPayment(false);
    onUpdated();
  };

  const handleSaveEdits = () => {
    storageService.updateRepairJob({
      ...job,
      device_problem: editProblem.trim(),
      repairing_cost: Number(editCost) || 0,
      expected_delivery_date: editExpectedDate,
    });
    setIsEditing(false);
    onUpdated();
  };

  const handleDelete = () => {
    storageService.deleteRepairJob(job.job_id);
    onUpdated();
    onClose();
  };

  const formattedDate = (dateStr?: string) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#2C3E50] text-white shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold font-tabular tracking-wide text-blue-300">
              {job.job_id}
            </span>
            <span className="text-sm font-semibold truncate max-w-[200px] sm:max-w-none">
              {job.mobile_brand} {job.mobile_model}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenReceipt}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300">
          {/* Status & Quick Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Current Status
              </span>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {STATUS_LABELS[job.repair_status]?.[settings.selected_language] || job.repair_status}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {job.repair_status !== 'delivered' && (
                <button
                  onClick={onOpenDelivery}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition flex items-center gap-1.5"
                >
                  <PackageCheck className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'حوالگی مکمل کریں' : 'Mark Delivered'}</span>
                </button>
              )}
              <button
                onClick={onOpenReceipt}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-medium rounded-lg transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'رسید' : 'Receipt'}</span>
              </button>
            </div>
          </div>

          {/* Customer & Intake Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-700">
                <User className="w-4 h-4 text-blue-600" />
                <span>{isUrdu ? 'گاہک کی معلومات' : 'Customer Info'}</span>
              </div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">
                {job.customer_name}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <a
                  href={`tel:${job.mobile_number}`}
                  className="flex items-center gap-1 text-blue-600 hover:underline font-tabular"
                >
                  <Phone className="w-3 h-3" />
                  <span>{job.mobile_number}</span>
                </a>
                {job.additional_number && (
                  <span className="text-slate-400 font-tabular">
                    Alt: {job.additional_number}
                  </span>
                )}
              </div>
              {job.address && (
                <p className="text-slate-500 mt-1 text-[11px]">{job.address}</p>
              )}
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-700">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                <span>{isUrdu ? 'ڈیوائس اور وصولی' : 'Device & Timeline'}</span>
              </div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">
                {job.mobile_brand} {job.mobile_model}
              </p>
              {job.imei_number && (
                <p className="font-mono text-slate-500 text-[11px] mt-0.5">
                  IMEI: {job.imei_number}
                </p>
              )}
              <div className="flex items-center gap-3 mt-1.5 text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formattedDate(job.received_date)}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{job.received_time}</span>
                </span>
              </div>
              {job.expected_delivery_date && (
                <p className="text-amber-600 text-[11px] mt-1">
                  Expected Delivery: {formattedDate(job.expected_delivery_date)}
                </p>
              )}
            </div>
          </div>

          {/* Reported Issue & Condition */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-900 dark:text-white">
                {isUrdu ? 'مسئلہ و ظاہری حالت' : 'Reported Fault & Condition'}
              </span>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-[11px]"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{isUrdu ? 'تبدیل کریں' : 'Edit'}</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3 mt-2">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">
                    Problem Description
                  </label>
                  <textarea
                    rows={2}
                    value={editProblem}
                    onChange={(e) => setEditProblem(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      Repairing Cost ({settings.currency_symbol})
                    </label>
                    <input
                      type="number"
                      value={editCost}
                      onChange={(e) => setEditCost(Number(e.target.value))}
                      className="w-full p-2 font-tabular bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      Expected Delivery
                    </label>
                    <input
                      type="date"
                      value={editExpectedDate}
                      onChange={(e) => setEditExpectedDate(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdits}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg"
                  >
                    Save Edits
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  {job.device_problem}
                </p>
                {job.device_condition && (
                  <p className="text-slate-500 text-[11px] mt-1">
                    Condition: {job.device_condition}
                  </p>
                )}
              </div>
            )}

            {/* Accessories chips */}
            <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400 mr-1">
                {isUrdu ? 'موصولہ سامان:' : 'Accessories:'}
              </span>
              {job.accessories.length > 0 ? (
                job.accessories.map((acc, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[11px]"
                  >
                    {acc}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 italic">None (Device only)</span>
              )}
              {job.other_accessory_note && (
                <span className="text-slate-500 text-[11px]">
                  ({job.other_accessory_note})
                </span>
              )}
            </div>
          </div>

          {/* FINANCIALS & PAYMENTS MODULE */}
          <div className="p-3.5 bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>{isUrdu ? 'ادائیگیاں اور بقایا حساب' : 'Payments & Ledger'}</span>
              </div>
              <button
                onClick={() => setShowAddPayment(!showAddPayment)}
                className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 rounded-lg font-medium text-[11px] flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'ادائیگی شامل کریں' : 'Add Payment'}</span>
              </button>
            </div>

            {/* Financial summary numbers */}
            <div className="grid grid-cols-3 gap-2 mb-3 text-center">
              <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Total Cost</span>
                <span className="font-bold font-tabular text-sm text-slate-900 dark:text-white">
                  {settings.currency_symbol} {summary.cost.toLocaleString()}
                </span>
              </div>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] text-emerald-600 uppercase block">Total Paid</span>
                <span className="font-bold font-tabular text-sm text-emerald-700 dark:text-emerald-400">
                  {settings.currency_symbol} {summary.paid.toLocaleString()}
                </span>
              </div>
              <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                <span className="text-[10px] text-amber-600 uppercase block">Remaining</span>
                <span className="font-bold font-tabular text-sm text-amber-700 dark:text-amber-400">
                  {settings.currency_symbol} {summary.balance.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Inline Add Payment Form */}
            {showAddPayment && (
              <form
                onSubmit={handleAddPayment}
                className="p-3 mb-3 bg-blue-50/60 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800 space-y-2 animate-in fade-in"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-blue-950 dark:text-blue-200">
                    Record Installment Payment
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddPayment(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Amount</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max={summary.balance > 0 ? summary.balance : undefined}
                      value={paymentAmount}
                      onChange={(e) =>
                        setPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      placeholder={summary.balance > 0 ? String(summary.balance) : '1000'}
                      className="w-full px-2.5 py-1.5 font-bold font-tabular bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                    >
                      <option value="cash">Cash</option>
                      <option value="jazzcash">JazzCash</option>
                      <option value="easypaisa">Easypaisa</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Notes</label>
                    <input
                      type="text"
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      placeholder="e.g. Paid balance"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-xs shadow-xs"
                  >
                    Confirm Payment
                  </button>
                </div>
              </form>
            )}

            {/* List of payments */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Payment Transactions ({payments.length})
              </span>
              {payments.length > 0 ? (
                payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200/80 dark:border-slate-800 text-[11px]"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {settings.currency_symbol} {p.amount.toLocaleString()}
                      </span>
                      <span className="text-slate-400 mx-1.5">·</span>
                      <span className="capitalize text-slate-600 dark:text-slate-400">
                        {p.payment_method}
                      </span>
                      {p.notes && (
                        <span className="text-slate-400 ml-2">({p.notes})</span>
                      )}
                    </div>
                    <span className="font-tabular text-slate-500">
                      {formattedDate(p.payment_date)} {p.payment_time}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic text-center py-2">No payments recorded yet.</p>
              )}
            </div>
          </div>

          {/* STATUS CHANGER & AUDIT TIMELINE */}
          <div className="p-3.5 bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white mb-2.5 pb-2 border-b border-slate-100 dark:border-slate-700">
              <History className="w-4 h-4 text-purple-600" />
              <span>{isUrdu ? 'مرمت کی حالت تبدیل کریں اور تاریخچہ' : 'Update Status & Audit Trail'}</span>
            </div>

            <form onSubmit={handleUpdateStatus} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">New Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as RepairStatus)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting_for_parts">Waiting for Parts</option>
                  <option value="repaired">Repaired</option>
                  <option value="ready_for_delivery">Ready for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="unrepairable">Unrepairable</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Technician / Note</label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Display installed and tested"
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={selectedStatus === job.repair_status || isUpdatingStatus}
                  className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-xs transition disabled:opacity-40"
                >
                  {isUpdatingStatus ? 'Updating...' : 'Save New Status'}
                </button>
              </div>
            </form>

            {/* Audit log list */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {historyList.map((h) => (
                <div
                  key={h.id}
                  className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-800 text-[11px]"
                >
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {h.previous_status} →{' '}
                      <span className="text-purple-600 dark:text-purple-400 font-semibold">
                        {h.new_status}
                      </span>
                    </span>
                    <span className="font-tabular text-[10px]">
                      {new Date(h.changed_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {h.notes && (
                    <p className="text-slate-600 dark:text-slate-400 text-[10px] mt-0.5">
                      {h.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Delete Danger Zone */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            {deleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-600 font-semibold">
                  Confirm permanent deletion?
                </span>
                <button
                  onClick={handleDelete}
                  className="px-2.5 py-1 bg-rose-600 text-white rounded text-xs font-semibold"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="text-rose-600 hover:text-rose-700 text-xs flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Job Record</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
