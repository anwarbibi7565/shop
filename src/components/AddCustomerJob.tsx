import React, { useState, useEffect } from 'react';
import {
  RepairJob,
  ShopSettings,
  PaymentMethod,
} from '../types';
import {
  ACCESSORIES_LIST,
  POPULAR_BRANDS,
  COMMON_PROBLEMS,
  DEVICE_CONDITIONS,
  TRANSLATIONS,
} from '../translations';
import { storageService } from '../services/storage';
import {
  User,
  Smartphone,
  CheckSquare,
  DollarSign,
  Calendar,
  Clock,
  Printer,
  Share2,
  CheckCircle2,
  PlusCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface AddCustomerJobProps {
  settings: ShopSettings;
  onJobCreated: (job: RepairJob, openReceipt: boolean) => void;
  onNavigateHistory: () => void;
}

export const AddCustomerJob: React.FC<AddCustomerJobProps> = ({
  settings,
  onJobCreated,
  onNavigateHistory,
}) => {
  const t = TRANSLATIONS[settings.selected_language] || TRANSLATIONS.en;
  const isUrdu = settings.selected_language === 'ur';

  // Helper to get local date & time
  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const getCurrentTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  // State
  const [jobId, setJobId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [additionalNumber, setAdditionalNumber] = useState('');
  const [address, setAddress] = useState('');

  const [mobileBrand, setMobileBrand] = useState('Samsung');
  const [customBrand, setCustomBrand] = useState('');
  const [mobileModel, setMobileModel] = useState('');
  const [imeiNumber, setImeiNumber] = useState('');
  const [deviceProblem, setDeviceProblem] = useState('');
  const [deviceCondition, setDeviceCondition] = useState(DEVICE_CONDITIONS[0]);
  const [receivedDate, setReceivedDate] = useState(getTodayDate());
  const [receivedTime, setReceivedTime] = useState(getCurrentTime());
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');

  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([
    'Battery',
    'SIM Card',
  ]);
  const [otherAccessoryNote, setOtherAccessoryNote] = useState('');

  // Financials
  const [repairingCost, setRepairingCost] = useState<number | ''>('');
  const [advancePayment, setAdvancePayment] = useState<number | ''>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentNotes, setPaymentNotes] = useState('Advance payment');

  // Submission / Success State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdJob, setCreatedJob] = useState<RepairJob | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Generate preview Job ID
  useEffect(() => {
    const nextNum = storageService.getNextJobNumber() + 1;
    setJobId(`REP-${String(nextNum).padStart(5, '0')}`);
  }, []);

  // Calculated remaining balance
  const costNumber = Number(repairingCost) || 0;
  const advanceNumber = Number(advancePayment) || 0;
  const remainingBalance = Math.max(0, costNumber - advanceNumber);

  const toggleAccessory = (accName: string) => {
    setSelectedAccessories((prev) =>
      prev.includes(accName)
        ? prev.filter((item) => item !== accName)
        : [...prev, accName]
    );
  };

  const handleQuickProblem = (prob: string) => {
    if (!deviceProblem) {
      setDeviceProblem(prob);
    } else if (!deviceProblem.includes(prob)) {
      setDeviceProblem((prev) => `${prev}, ${prob}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Form Validations
    if (!customerName.trim()) {
      setErrorMsg(isUrdu ? 'براہ کرم گاہک کا نام درج کریں۔' : 'Customer name is required.');
      return;
    }
    if (!mobileNumber.trim()) {
      setErrorMsg(isUrdu ? 'براہ کرم گاہک کا موبائل نمبر درج کریں۔' : 'Customer phone number is required.');
      return;
    }
    if (!mobileModel.trim()) {
      setErrorMsg(isUrdu ? 'موبائل ماڈل درج کریں۔' : 'Mobile model is required.');
      return;
    }
    if (!deviceProblem.trim()) {
      setErrorMsg(isUrdu ? 'فون میں خرابی یا مسئلہ درج کریں۔' : 'Device problem/fault description is required.');
      return;
    }
    if (costNumber < 0) {
      setErrorMsg(isUrdu ? 'مرمت کے چارجز درست درج کریں۔' : 'Repairing cost must be valid.');
      return;
    }
    if (advanceNumber > costNumber && costNumber > 0) {
      setErrorMsg(
        isUrdu
          ? 'ایڈوانس رقم کل چارجز سے زیادہ نہیں ہو سکتی۔'
          : 'Advance payment cannot exceed total repairing cost without explicit confirmation.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const generatedId = storageService.generateJobId();
      const finalBrand =
        mobileBrand === 'Other' && customBrand.trim()
          ? customBrand.trim()
          : mobileBrand;

      const newJobData = {
        job_id: generatedId,
        customer_id: 'cust_' + Date.now(),
        customer_name: customerName.trim(),
        mobile_number: mobileNumber.trim(),
        additional_number: additionalNumber.trim(),
        address: address.trim(),
        mobile_brand: finalBrand,
        mobile_model: mobileModel.trim(),
        imei_number: imeiNumber.trim(),
        device_problem: deviceProblem.trim(),
        device_condition: deviceCondition,
        accessories: selectedAccessories,
        other_accessory_note: selectedAccessories.includes('Other Accessories')
          ? otherAccessoryNote.trim()
          : '',
        received_date: receivedDate,
        received_time: receivedTime,
        expected_delivery_date: expectedDeliveryDate,
        repairing_cost: costNumber,
        repair_status: 'pending' as const,
      };

      const savedJob = storageService.addRepairJob(
        newJobData,
        advanceNumber,
        paymentMethod,
        paymentNotes
      );

      setCreatedJob(savedJob);
      setIsSubmitting(false);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to save repair job.');
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCustomerName('');
    setMobileNumber('');
    setAdditionalNumber('');
    setAddress('');
    setMobileBrand('Samsung');
    setCustomBrand('');
    setMobileModel('');
    setImeiNumber('');
    setDeviceProblem('');
    setDeviceCondition(DEVICE_CONDITIONS[0]);
    setReceivedDate(getTodayDate());
    setReceivedTime(getCurrentTime());
    setExpectedDeliveryDate('');
    setSelectedAccessories(['Battery', 'SIM Card']);
    setOtherAccessoryNote('');
    setRepairingCost('');
    setAdvancePayment(0);
    setPaymentMethod('cash');
    setCreatedJob(null);
    setErrorMsg('');
    const nextNum = storageService.getNextJobNumber() + 1;
    setJobId(`REP-${String(nextNum).padStart(5, '0')}`);
  };

  // If successfully created, display completion confirmation & quick actions
  if (createdJob) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isUrdu ? 'مرمت کا اندراج کامیابی سے ہو گیا!' : 'Repair Job Registered Successfully!'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {isUrdu ? 'جاب آئی ڈی' : 'Generated Repair Job ID'}:{' '}
            <span className="font-bold font-tabular text-[#2C3E50] dark:text-blue-400 text-base">
              {createdJob.job_id}
            </span>
          </p>

          <div className="my-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-left text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">{isUrdu ? 'گاہک:' : 'Customer:'}</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {createdJob.customer_name} ({createdJob.mobile_number})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{isUrdu ? 'موبائل فون:' : 'Device:'}</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {createdJob.mobile_brand} {createdJob.mobile_model}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{isUrdu ? 'طے شدہ چارجز:' : 'Total Cost:'}</span>
              <span className="font-bold font-tabular text-slate-900 dark:text-white">
                {settings.currency_symbol} {createdJob.repairing_cost.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>{isUrdu ? 'ایڈوانس وصولی:' : 'Advance Paid:'}</span>
              <span className="font-bold font-tabular">
                {settings.currency_symbol} {advanceNumber.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-amber-600 dark:text-amber-400 font-semibold border-t border-slate-200 dark:border-slate-700 pt-2">
              <span>{isUrdu ? 'بقایا واجب الادا:' : 'Remaining Balance:'}</span>
              <span className="font-tabular">
                {settings.currency_symbol} {remainingBalance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onJobCreated(createdJob, true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2C3E50] hover:bg-slate-800 text-white font-medium rounded-xl shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>{isUrdu ? 'رسید دیکھیں اور پرنٹ کریں' : 'View & Print Receipt'}</span>
            </button>
            <button
              onClick={resetForm}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 rounded-xl transition-colors font-medium"
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <span>{isUrdu ? 'ایک اور نیا فون درج کریں' : 'Add Another Job'}</span>
            </button>
            <button
              onClick={onNavigateHistory}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
            >
              <span>{isUrdu ? 'مرمت کی فہرست دیکھیں' : 'View All Repairs'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Page Title */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isUrdu ? 'نیا گاہک اور مرمت کا اندراج' : 'Add Customer / New Repair Job'}
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            {isUrdu
              ? 'موبائل وصول کریں، مسئلہ، سامان اور اخراجات درج کر کے فوری رسید بنائیں'
              : 'Register customer mobile intake, accessories, costs, and auto-generate receipt'}
          </p>
        </div>
        <div className="hidden sm:block text-right">
          <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
            {isUrdu ? 'متوقع جاب نمبر' : 'Estimated Job ID'}
          </span>
          <span className="font-bold font-tabular text-[#2C3E50] dark:text-blue-400 text-base">
            {jobId}
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: CUSTOMER DETAILS */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 md:p-6 shadow-xs">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-base text-slate-900 dark:text-white">
              {isUrdu ? '1. گاہک کی تفصیلات' : '1. Customer Details'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {isUrdu ? 'گاہک کا نام *' : 'Customer Name *'}
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={isUrdu ? 'مثلاً علی احمد' : 'e.g. Ali Ahmad'}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {isUrdu ? 'موبائل نمبر (واٹس ایپ) *' : 'Mobile Number (WhatsApp) *'}
              </label>
              <input
                type="tel"
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder={isUrdu ? '03001234567' : '03001234567'}
                className="w-full px-3.5 py-2.5 text-sm font-tabular bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {isUrdu ? 'اضافی رابطہ نمبر (اختیاری)' : 'Additional Number (Optional)'}
              </label>
              <input
                type="tel"
                value={additionalNumber}
                onChange={(e) => setAdditionalNumber(e.target.value)}
                placeholder="0321XXXXXXX"
                className="w-full px-3.5 py-2.5 text-sm font-tabular bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {isUrdu ? 'پتہ / علاقہ (اختیاری)' : 'Customer Address / Area (Optional)'}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={isUrdu ? 'مثلاً گلبرگ، لاہور' : 'e.g. Gulberg, Lahore'}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: MOBILE PHONE DETAILS */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 md:p-6 shadow-xs">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            <Smartphone className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold text-base text-slate-900 dark:text-white">
              {isUrdu ? '2. موبائل فون کی تفصیلات' : '2. Mobile Phone Details'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {isUrdu ? 'موبائل کمپنی / برانڈ *' : 'Mobile Brand *'}
              </label>
              <select
                value={mobileBrand}
                onChange={(e) => setMobileBrand(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition cursor-pointer"
              >
                {POPULAR_BRANDS.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
              {mobileBrand === 'Other' && (
                <input
                  type="text"
                  placeholder="Specify brand name"
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  className="mt-2 w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-xl"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {isUrdu ? 'موبائل ماڈل *' : 'Mobile Model *'}
              </label>
              <input
                type="text"
                required
                value={mobileModel}
                onChange={(e) => setMobileModel(e.target.value)}
                placeholder={isUrdu ? 'مثلاً Vivo Y20, iPhone 12' : 'e.g. Vivo Y20, iPhone 12'}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {isUrdu ? 'آئی ایم ای آئی (IMEI) نمبر (اختیاری)' : 'IMEI Number (Optional)'}
              </label>
              <input
                type="text"
                value={imeiNumber}
                onChange={(e) => setImeiNumber(e.target.value)}
                placeholder="15-digit IMEI"
                maxLength={18}
                className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition"
              />
            </div>
          </div>

          {/* Problem description + Quick problem tags */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                {isUrdu ? 'موبائل کی خرابی / مسئلہ *' : 'Device Problem / Fault Description *'}
              </label>
              <span className="text-[11px] text-slate-400">
                {isUrdu ? 'عام مسائل پر کلک کریں' : 'Click quick tags below to auto-fill'}
              </span>
            </div>
            <textarea
              required
              rows={2}
              value={deviceProblem}
              onChange={(e) => setDeviceProblem(e.target.value)}
              placeholder={isUrdu ? 'خرابی کی تفصیل لکھیں...' : 'Describe the fault, symptoms, or requested repair...'}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition"
            />
            {/* Quick tags */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {COMMON_PROBLEMS.map((prob) => (
                <button
                  type="button"
                  key={prob}
                  onClick={() => handleQuickProblem(prob)}
                  className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                >
                  + {prob}
                </button>
              ))}
            </div>
          </div>

          {/* Condition, Received Date & Time, Expected Delivery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {isUrdu ? 'ظاہری حالت' : 'Device Condition'}
              </label>
              <select
                value={deviceCondition}
                onChange={(e) => setDeviceCondition(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {DEVICE_CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{isUrdu ? 'وصولی کی تاریخ *' : 'Received Date *'}</span>
              </label>
              <input
                type="date"
                required
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-tabular bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{isUrdu ? 'وصولی کا وقت *' : 'Received Time *'}</span>
              </label>
              <input
                type="time"
                required
                value={receivedTime}
                onChange={(e) => setReceivedTime(e.target.value)}
                className="w-full px-3 py-2 text-xs font-tabular bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>{isUrdu ? 'متوقع واپسی تاریخ' : 'Est. Delivery Date'}</span>
              </label>
              <input
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-tabular bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: ACCESSORIES MANAGEMENT */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 md:p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-600" />
              <h2 className="font-semibold text-base text-slate-900 dark:text-white">
                {isUrdu ? '3. موصولہ سامان (چیک لسٹ)' : '3. Mobile Accessories Received'}
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              {selectedAccessories.length} {isUrdu ? 'منتخب شدہ' : 'selected'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {ACCESSORIES_LIST.map((item) => {
              const isChecked = selectedAccessories.includes(item.id);
              return (
                <label
                  key={item.id}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer select-none transition-colors ${
                    isChecked
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200 font-medium'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleAccessory(item.id)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span className="text-xs">
                    {isUrdu ? item.labelUrdu : item.label}
                  </span>
                </label>
              );
            })}
          </div>

          {selectedAccessories.includes('Other Accessories') && (
            <div className="mt-3">
              <input
                type="text"
                placeholder={isUrdu ? 'دیگر سامان کی تفصیل لکھیں...' : 'Specify additional accessories received...'}
                value={otherAccessoryNote}
                onChange={(e) => setOtherAccessoryNote(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* SECTION 4: REPAIRING COST & PAYMENT MANAGEMENT */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 md:p-6 shadow-xs">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            <DollarSign className="w-5 h-5 text-amber-600" />
            <h2 className="font-semibold text-base text-slate-900 dark:text-white">
              {isUrdu ? '4. مرمت کے چارجز اور ایڈوانس ادائیگی' : '4. Repairing Cost & Advance Payment'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Total Cost */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {isUrdu ? 'کل طے شدہ چارجز *' : 'Total Repairing Cost *'} ({settings.currency_symbol})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">
                  {settings.currency_symbol}
                </span>
                <input
                  type="number"
                  min="0"
                  required
                  value={repairingCost}
                  onChange={(e) =>
                    setRepairingCost(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="5000"
                  className="w-full pl-12 pr-3.5 py-2.5 text-base font-bold font-tabular bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition"
                />
              </div>
            </div>

            {/* Advance Payment */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {isUrdu ? 'ایڈوانس وصولی' : 'Advance Payment'} ({settings.currency_symbol})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-bold text-emerald-600">
                  {settings.currency_symbol}
                </span>
                <input
                  type="number"
                  min="0"
                  value={advancePayment}
                  onChange={(e) =>
                    setAdvancePayment(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="2000"
                  className="w-full pl-12 pr-3.5 py-2.5 text-base font-bold font-tabular bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition text-emerald-700 dark:text-emerald-400"
                />
              </div>
            </div>

            {/* Remaining Balance (Auto-calculated) */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {isUrdu ? 'خودکار بقایا رقم' : 'Remaining Balance (Auto-Calculated)'}
              </label>
              <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {remainingBalance === 0 && costNumber > 0 ? (
                    <span className="text-emerald-600 font-semibold">Fully Paid</span>
                  ) : (
                    <span>Balance Due</span>
                  )}
                </span>
                <span className="text-base font-bold font-tabular text-[#2C3E50] dark:text-blue-400">
                  {settings.currency_symbol} {remainingBalance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method & Notes if Advance > 0 */}
          {advanceNumber > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isUrdu ? 'ایڈوانس ادائیگی کا ذریعہ' : 'Advance Payment Method'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['cash', 'jazzcash', 'easypaisa', 'bank_transfer', 'other'] as PaymentMethod[]).map(
                    (method) => (
                      <button
                        type="button"
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                          paymentMethod === method
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {method === 'cash' && (isUrdu ? 'کیش (نقد)' : 'Cash')}
                        {method === 'jazzcash' && 'JazzCash'}
                        {method === 'easypaisa' && 'Easypaisa'}
                        {method === 'bank_transfer' && (isUrdu ? 'بینک ٹرانسفر' : 'Bank')}
                        {method === 'other' && (isUrdu ? 'دیگر' : 'Other')}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isUrdu ? 'ادائیگی کے نوٹس' : 'Payment Reference / Notes'}
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Received at front desk"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>
          )}
        </div>

        {/* Form Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#2C3E50] hover:bg-slate-800 text-white font-semibold rounded-xl shadow-md transition-transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
          >
            <Printer className="w-4 h-4" />
            <span>
              {isSubmitting
                ? isUrdu
                  ? 'محفوظ ہو رہا ہے...'
                  : 'Saving...'
                : isUrdu
                ? 'محفوظ کریں اور رسید بنائیں'
                : 'Save Repair Job & Create Receipt'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
