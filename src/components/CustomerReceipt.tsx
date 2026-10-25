import React, { useState } from 'react';
import {
  RepairJob,
  ShopSettings,
  PaymentTransaction,
} from '../types';
import { TRANSLATIONS, STATUS_LABELS } from '../translations';
import {
  Printer,
  Share2,
  Copy,
  Check,
  X,
  Smartphone,
  PhoneCall,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  PackageCheck,
  AlertCircle,
} from 'lucide-react';

interface CustomerReceiptProps {
  job: RepairJob;
  settings: ShopSettings;
  payments: PaymentTransaction[];
  onClose: () => void;
}

export const CustomerReceipt: React.FC<CustomerReceiptProps> = ({
  job,
  settings,
  payments,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const t = TRANSLATIONS[settings.selected_language] || TRANSLATIONS.en;
  const isUrdu = settings.selected_language === 'ur';

  // Calculate finances
  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const remainingBalance = Math.max(0, job.repairing_cost - totalPaid);

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

  const handlePrint = () => {
    window.print();
  };

  const generateWhatsAppMessage = () => {
    const currency = settings.currency_symbol || 'Rs.';
    const accessoriesText =
      job.accessories.length > 0 ? job.accessories.join(', ') : 'None';

    if (isUrdu) {
      return `*${settings.shop_name}*
مرمتی رسید (رسید نمبر: *${job.job_id}*)
-----------------------------
گاہک کا نام: ${job.customer_name}
موبائل فون: ${job.mobile_brand} ${job.mobile_model}
مسئلہ / خرابی: ${job.device_problem}
موصولہ سامان: ${accessoriesText}
وصولی کی تاریخ: ${formattedDate(job.received_date)} بوقت ${job.received_time}
متوقع واپسی: ${job.expected_delivery_date ? formattedDate(job.expected_delivery_date) : 'جلد از جلد'}
-----------------------------
کل خرچ: ${currency} ${job.repairing_cost.toLocaleString()}
ادا شدہ رقم: ${currency} ${totalPaid.toLocaleString()}
*بقایا واجب الادا: ${currency} ${remainingBalance.toLocaleString()}*
حالت: ${STATUS_LABELS[job.repair_status]?.ur || job.repair_status}
-----------------------------
رابطہ: ${settings.shop_phone}
پتہ: ${settings.shop_address}
شکریا!`;
    }

    return `*${settings.shop_name}*
REPAIR RECEIPT - JOB ID: *${job.job_id}*
-----------------------------
Customer: ${job.customer_name} (${job.mobile_number})
Device: ${job.mobile_brand} ${job.mobile_model}
Problem: ${job.device_problem}
Accessories: ${accessoriesText}
Received: ${formattedDate(job.received_date)} at ${job.received_time}
Expected Delivery: ${job.expected_delivery_date ? formattedDate(job.expected_delivery_date) : 'As soon as ready'}
-----------------------------
Total Charges: ${currency} ${job.repairing_cost.toLocaleString()}
Paid Amount: ${currency} ${totalPaid.toLocaleString()}
*Remaining Balance: ${currency} ${remainingBalance.toLocaleString()}*
Status: ${STATUS_LABELS[job.repair_status]?.en || job.repair_status}
-----------------------------
Shop Contact: ${settings.shop_phone}
Address: ${settings.shop_address}
Thank you for your business!`;
  };

  const handleShareWhatsApp = () => {
    const rawPhone = job.mobile_number.replace(/[^0-9]/g, '');
    let phoneNum = rawPhone;
    if (phoneNum.startsWith('0')) {
      // Pakistani 0300 -> 92300
      phoneNum = '92' + phoneNum.slice(1);
    }
    const message = encodeURIComponent(generateWhatsAppMessage());
    const waUrl = phoneNum
      ? `https://wa.me/${phoneNum}?text=${message}`
      : `https://wa.me/?text=${message}`;
    window.open(waUrl, '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateWhatsAppMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Header Bar (no-print) */}
        <div className="no-print flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-400" />
            <span className="font-semibold text-sm tracking-wide">
              {isUrdu ? 'مرمتی رسید' : 'Repair Job Receipt'} · {job.job_id}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls Bar (no-print) */}
        <div className="no-print p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2C3E50] hover:bg-slate-800 text-white font-medium rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'پرنٹ کریں' : 'Print Receipt'}</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isUrdu ? 'کاپی ہو گئی' : 'Copied'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'متن کاپی کریں' : 'Copy Text'}</span>
              </>
            )}
          </button>
        </div>

        {/* Actual Printable Receipt Sheet */}
        <div className="printable-area p-6 sm:p-7 bg-white text-slate-900 max-h-[80vh] overflow-y-auto">
          {/* Shop Header */}
          <div className="text-center border-b border-slate-200 pb-4 mb-4">
            <div className="flex justify-center mb-2">
              {settings.shop_logo ? (
                <img
                  src={settings.shop_logo}
                  alt={settings.shop_name}
                  className="w-14 h-14 object-contain rounded-lg border border-slate-200 p-1"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xl">
                  {settings.shop_name.charAt(0)}
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {settings.shop_name}
            </h2>
            <div className="text-xs text-slate-600 mt-1 space-y-0.5">
              <p className="flex items-center justify-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{settings.shop_address}</span>
              </p>
              <p className="flex items-center justify-center gap-2">
                <span className="flex items-center gap-1">
                  <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                  <span>{settings.shop_phone}</span>
                </span>
                {settings.shop_email && (
                  <span>· {settings.shop_email}</span>
                )}
              </p>
            </div>
          </div>

          {/* Job ID & Barcode simulation */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Repair Job Reference
              </span>
              <p className="text-lg font-bold font-tabular text-[#2C3E50]">
                {job.job_id}
              </p>
              <p className="text-xs text-slate-500">
                Status: <strong className="text-slate-800">{STATUS_LABELS[job.repair_status]?.[settings.selected_language] || job.repair_status}</strong>
              </p>
            </div>
            {/* Visual Barcode Strip */}
            <div className="text-right">
              <div className="inline-flex items-center gap-[2px] h-9 px-2 bg-white border border-slate-200 rounded">
                {[
                  3, 1, 4, 1, 2, 4, 1, 3, 2, 1, 3, 1, 4, 2, 1, 3, 1, 2, 4, 1, 3,
                ].map((w, idx) => (
                  <span
                    key={idx}
                    style={{ width: `${w}px` }}
                    className="h-7 bg-slate-900 inline-block"
                  />
                ))}
              </div>
              <p className="text-[9px] font-mono text-slate-500 mt-0.5">
                {job.job_id}
              </p>
            </div>
          </div>

          {/* Customer & Intake Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs mb-4 pb-3 border-b border-dashed border-slate-200">
            <div>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                {isUrdu ? 'گاہک کی معلومات' : 'Customer Details'}
              </span>
              <p className="font-semibold text-slate-900 text-sm mt-0.5">
                {job.customer_name}
              </p>
              <p className="text-slate-600 font-tabular">{job.mobile_number}</p>
              {job.additional_number && (
                <p className="text-slate-500 text-[11px] font-tabular">
                  Alt: {job.additional_number}
                </p>
              )}
              {job.address && (
                <p className="text-slate-500 text-[11px] truncate">
                  {job.address}
                </p>
              )}
            </div>
            <div className="text-right">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                {isUrdu ? 'وصولی کا وقت' : 'Intake Details'}
              </span>
              <p className="flex items-center justify-end gap-1 text-slate-700 font-tabular mt-0.5">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{formattedDate(job.received_date)}</span>
              </p>
              <p className="flex items-center justify-end gap-1 text-slate-700 font-tabular">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{job.received_time}</span>
              </p>
              {job.expected_delivery_date && (
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Est. Delivery: {formattedDate(job.expected_delivery_date)}
                </p>
              )}
            </div>
          </div>

          {/* Device & Reported Problem */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs mb-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  {isUrdu ? 'فون ماڈل و خرابی' : 'Device & Issue'}
                </span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {job.mobile_brand} {job.mobile_model}
                </p>
              </div>
              {job.imei_number && (
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase">IMEI</span>
                  <p className="font-mono text-[11px] text-slate-700">
                    {job.imei_number}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-2 pt-2 border-t border-slate-200/70">
              <p className="text-slate-700 font-medium">
                <span className="text-slate-500 font-normal">
                  {isUrdu ? 'مسئلہ: ' : 'Problem: '}
                </span>
                {job.device_problem}
              </p>
              {job.device_condition && (
                <p className="text-slate-500 text-[11px] mt-0.5">
                  <span>{isUrdu ? 'حالت: ' : 'Condition: '}</span>
                  {job.device_condition}
                </p>
              )}
            </div>
          </div>

          {/* Received Accessories Checklist */}
          <div className="mb-4">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              {isUrdu ? 'موصولہ سامان' : 'Accessories Received'}
            </span>
            {job.accessories.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {job.accessories.map((acc, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200"
                  >
                    <PackageCheck className="w-3 h-3 text-emerald-600" />
                    <span>{acc}</span>
                  </span>
                ))}
                {job.other_accessory_note && (
                  <span className="inline-flex items-center text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                    Note: {job.other_accessory_note}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                {isUrdu ? 'کوئی سامان موصول نہیں ہوا (صرف فون)' : 'No additional accessories received (Device only)'}
              </p>
            )}
          </div>

          {/* Payment Breakdown */}
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 mb-4">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              {isUrdu ? 'حساب کتاب' : 'Payment Summary'}
            </span>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{isUrdu ? 'کل طے شدہ چارجز' : 'Total Repair Cost:'}</span>
                <span className="font-semibold font-tabular text-slate-900">
                  {settings.currency_symbol} {job.repairing_cost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>{isUrdu ? 'وصول شدہ رقم (ایڈوانس / ادائیگیاں)' : 'Total Amount Paid:'}</span>
                <span className="font-semibold font-tabular">
                  - {settings.currency_symbol} {totalPaid.toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                <span className={remainingBalance > 0 ? 'text-amber-700' : 'text-emerald-700'}>
                  {isUrdu ? 'بقایا واجب الادا' : 'Remaining Balance:'}
                </span>
                <span className={`font-tabular ${remainingBalance > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {settings.currency_symbol} {remainingBalance.toLocaleString()}
                </span>
              </div>
            </div>

            {/* List individual payments if more than 1 */}
            {payments.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500 space-y-0.5">
                {payments.map((p, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {formattedDate(p.payment_date)} ({p.payment_method})
                    </span>
                    <span className="font-tabular">
                      {settings.currency_symbol} {p.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Terms & Policy */}
          <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-3 space-y-1">
            <p className="flex items-start gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>{settings.receipt_footer_message}</span>
            </p>
            <div className="pt-4 flex justify-between items-end text-[9px] text-slate-400 font-mono">
              <span>Customer Signature: __________________</span>
              <span>Shop Counter Stamp</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
