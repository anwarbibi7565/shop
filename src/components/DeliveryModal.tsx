import React, { useState } from 'react';
import { RepairJob, ShopSettings, PaymentMethod } from '../types';
import { storageService } from '../services/storage';
import { TRANSLATIONS } from '../translations';
import {
  PackageCheck,
  X,
  User,
  Calendar,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface DeliveryModalProps {
  job: RepairJob;
  settings: ShopSettings;
  onClose: () => void;
  onDelivered: () => void;
}

export const DeliveryModal: React.FC<DeliveryModalProps> = ({
  job,
  settings,
  onClose,
  onDelivered,
}) => {
  const isUrdu = settings.selected_language === 'ur';
  const getToday = () => new Date().toISOString().split('T')[0];
  const getTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const summary = storageService.getJobPaymentSummary(job);
  const remaining = summary.balance;

  const [deliveryDate, setDeliveryDate] = useState(getToday());
  const [deliveryTime, setDeliveryTime] = useState(getTime());
  const [deliveredTo, setDeliveredTo] = useState(job.customer_name);
  const [deliveredBy, setDeliveredBy] = useState('Counter Staff');
  const [collectPayment, setCollectPayment] = useState(remaining > 0 ? remaining : 0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [deliveryNotes, setDeliveryNotes] = useState('Customer inspected device and accepted delivery.');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveredTo.trim()) {
      setErrorMsg(isUrdu ? 'حوالگی پانے والے کا نام درج کریں۔' : 'Delivered to name is required.');
      return;
    }
    if (collectPayment > remaining) {
      setErrorMsg(
        isUrdu
          ? `وصولی کی رقم بقایا (${settings.currency_symbol} ${remaining}) سے زیادہ نہیں ہو سکتی۔`
          : `Collection cannot exceed remaining balance of ${settings.currency_symbol} ${remaining}`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      storageService.recordDelivery(
        {
          job_id: job.job_id,
          delivery_date: deliveryDate,
          delivery_time: deliveryTime,
          delivered_to: deliveredTo.trim(),
          delivered_by: deliveredBy.trim(),
          final_payment_collected: Number(collectPayment) || 0,
          delivery_notes: deliveryNotes.trim(),
        },
        Number(collectPayment) || 0,
        paymentMethod
      );

      onDelivered();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to record delivery.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#2C3E50] text-white">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-base">
              {isUrdu ? 'موبائل واپسی / حوالگی درج کریں' : 'Mark Device as Delivered'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Job summary card */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono text-slate-400">{job.job_id}</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {job.mobile_brand} {job.mobile_model}
                </p>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                  Customer: {job.customer_name} ({job.mobile_number})
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Remaining</span>
                <span className={`font-bold font-tabular text-sm ${remaining > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {settings.currency_symbol} {remaining.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Delivery Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{isUrdu ? 'حوالگی کی تاریخ *' : 'Delivery Date *'}</span>
              </label>
              <input
                type="date"
                required
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-tabular"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{isUrdu ? 'حوالگی کا وقت *' : 'Delivery Time *'}</span>
              </label>
              <input
                type="time"
                required
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-tabular"
              />
            </div>
          </div>

          {/* Delivered To & By */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                {isUrdu ? 'کس کے حوالے کیا گیا *' : 'Delivered To (Name) *'}
              </label>
              <input
                type="text"
                required
                value={deliveredTo}
                onChange={(e) => setDeliveredTo(e.target.value)}
                placeholder="Receiver name"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                {isUrdu ? 'کس نے حوالہ کیا *' : 'Delivered By (Staff) *'}
              </label>
              <input
                type="text"
                required
                value={deliveredBy}
                onChange={(e) => setDeliveredBy(e.target.value)}
                placeholder="Technician/Staff"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Final Payment Collection if balance exists */}
          {remaining > 0 ? (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-900 dark:text-amber-200">
                  {isUrdu ? 'آخری بقایا رقم وصولی' : 'Collect Final Balance'}
                </span>
                <span className="font-bold font-tabular text-amber-700">
                  Due: {settings.currency_symbol} {remaining.toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {isUrdu ? 'وصول شدہ رقم' : 'Amount Collected'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={remaining}
                    value={collectPayment}
                    onChange={(e) => setCollectPayment(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 font-bold font-tabular bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {isUrdu ? 'ادائیگی کا طریقہ' : 'Payment Method'}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer"
                  >
                    <option value="cash">{isUrdu ? 'کیش (نقد)' : 'Cash'}</option>
                    <option value="jazzcash">JazzCash</option>
                    <option value="easypaisa">Easypaisa</option>
                    <option value="bank_transfer">{isUrdu ? 'بینک ٹرانسفر' : 'Bank Transfer'}</option>
                    <option value="other">{isUrdu ? 'دیگر' : 'Other'}</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{isUrdu ? 'یہ فون پہلے ہی مکمل ادا شدہ ہے (بقایا صفر)۔' : 'This repair is already fully paid (0 balance).'}</span>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isUrdu ? 'حوالگی کے نوٹس' : 'Delivery Notes'}
            </label>
            <input
              type="text"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
            >
              {isUrdu ? 'منسوخ' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              <PackageCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'درج ہو رہا ہے...' : isUrdu ? 'حوالگی مکمل کریں' : 'Confirm Delivery'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
