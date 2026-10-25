import React, { useState, useRef } from 'react';
import {
  ShopSettings as ShopSettingsType,
  CurrencyCode,
  LanguageCode,
} from '../types';
import { storageService, DEFAULT_SETTINGS } from '../services/storage';
import { CURRENCY_SYMBOLS, TRANSLATIONS } from '../translations';
import {
  Store,
  Upload,
  Trash2,
  DollarSign,
  Languages,
  Moon,
  Sun,
  Database,
  CheckCircle2,
  RefreshCw,
  FileCheck,
  AlertCircle,
} from 'lucide-react';

interface ShopSettingsProps {
  settings: ShopSettingsType;
  onSettingsUpdated: (newSettings: ShopSettingsType) => void;
  onResetDemo: () => void;
}

export const ShopSettings: React.FC<ShopSettingsProps> = ({
  settings,
  onSettingsUpdated,
  onResetDemo,
}) => {
  const isUrdu = settings.selected_language === 'ur';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ShopSettingsType>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [backupMessage, setBackupMessage] = useState('');

  const handleInputChange = (field: keyof ShopSettingsType, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCurrencyChange = (curr: CurrencyCode) => {
    setFormData((prev) => ({
      ...prev,
      selected_currency: curr,
      currency_symbol: CURRENCY_SYMBOLS[curr] || '$',
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (PNG, JPG, JPEG).');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        handleInputChange('shop_logo', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    handleInputChange('shop_logo', '');
  };

  const handleResetToDefaultLogo = () => {
    handleInputChange('shop_logo', DEFAULT_SETTINGS.shop_logo);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveSettings(formData);
    onSettingsUpdated(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Export JSON backup
  const handleExportBackup = () => {
    const jsonStr = storageService.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mobile_repair_shop_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupMessage(isUrdu ? 'بیک اپ فائل ڈاؤنلوڈ ہو گئی ہے۔' : 'Backup downloaded successfully.');
    setTimeout(() => setBackupMessage(''), 3000);
  };

  // Restore JSON backup
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const success = storageService.restoreBackup(text);
        if (success) {
          const freshSettings = storageService.getSettings();
          setFormData(freshSettings);
          onSettingsUpdated(freshSettings);
          setBackupMessage(isUrdu ? 'ڈیٹا کامیابی سے بحال ہو گیا ہے!' : 'Data restored successfully!');
          setTimeout(() => setBackupMessage(''), 3000);
        } else {
          alert('Invalid backup file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isUrdu ? 'دکان کی ترتیبات و تخصیص' : 'Shop Settings & Customization'}
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            {isUrdu
              ? 'دکان کا نام، پتہ، لوگو، کرنسی، زبان اور رسید کی شرائط'
              : 'Customize shop identity, branding, logo, currency, language, and receipts'}
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>{isUrdu ? 'ترتیبات محفوظ ہو گئیں' : 'Settings Saved!'}</span>
          </div>
        )}
      </div>

      {backupMessage && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-800 text-xs rounded-xl border border-blue-200 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{backupMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SHOP IDENTITY & LOGO */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 md:p-6 shadow-xs">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            <Store className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-base text-slate-900 dark:text-white">
              {isUrdu ? '1. دکان کی معلومات اور لوگو' : '1. Shop Profile & Logo'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Logo Customization Column */}
            <div className="md:col-span-1 flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {isUrdu ? 'دکان کا لوگو' : 'Shop Logo'}
              </span>

              <div className="relative w-28 h-28 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden mb-3 shadow-xs">
                {formData.shop_logo ? (
                  <img
                    src={formData.shop_logo}
                    alt="Shop Logo"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <div className="text-slate-400 text-xs flex flex-col items-center">
                    <Store className="w-8 h-8 mb-1" />
                    <span>No Logo</span>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleLogoUpload}
                className="hidden"
              />

              <div className="flex flex-col gap-1.5 w-full">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'لوگو اپلوڈ کریں' : 'Upload Custom Logo'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetToDefaultLogo}
                  className="w-full px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs transition"
                >
                  {isUrdu ? 'ڈیفالٹ لوگو' : 'Use Default Logo'}
                </button>
                {formData.shop_logo && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="w-full px-3 py-1 text-rose-600 hover:text-rose-700 text-xs flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{isUrdu ? 'لوگو ہٹائیں' : 'Remove Logo'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Shop Details */}
            <div className="md:col-span-2 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {isUrdu ? 'دکان کا نام *' : 'Shop Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.shop_name}
                  onChange={(e) => handleInputChange('shop_name', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {isUrdu ? 'دکان کا پتہ *' : 'Shop Address *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.shop_address}
                  onChange={(e) => handleInputChange('shop_address', e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {isUrdu ? 'رابطہ نمبر / واٹس ایپ *' : 'Contact Phone / WhatsApp *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shop_phone}
                    onChange={(e) => handleInputChange('shop_phone', e.target.value)}
                    className="w-full px-3.5 py-2 font-tabular bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {isUrdu ? 'دکان کا ای میل' : 'Shop Email (Optional)'}
                  </label>
                  <input
                    type="email"
                    value={formData.shop_email}
                    onChange={(e) => handleInputChange('shop_email', e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {isUrdu ? 'رسید کی شرائط و ضوابط' : 'Receipt Footer Terms & Policy'}
                </label>
                <textarea
                  rows={2}
                  value={formData.receipt_footer_message}
                  onChange={(e) =>
                    handleInputChange('receipt_footer_message', e.target.value)
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CURRENCY & REGIONAL SETTINGS */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 md:p-6 shadow-xs">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h2 className="font-semibold text-base text-slate-900 dark:text-white">
              {isUrdu ? '2. کرنسی اور علاقائی ترتیبات' : '2. Currency & Localization'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-2">
                {isUrdu ? 'بنیادی کرنسی منتخب کریں' : 'Select Currency'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { code: 'PKR', label: 'Pakistani Rupee', symbol: 'Rs.' },
                  { code: 'USD', label: 'US Dollar', symbol: '$' },
                  { code: 'INR', label: 'Indian Rupee', symbol: '₹' },
                  { code: 'AED', label: 'UAE Dirham', symbol: 'AED' },
                  { code: 'SAR', label: 'Saudi Riyal', symbol: 'SAR' },
                  { code: 'EUR', label: 'Euro', symbol: '€' },
                ].map((cur) => (
                  <button
                    type="button"
                    key={cur.code}
                    onClick={() => handleCurrencyChange(cur.code as CurrencyCode)}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      formData.selected_currency === cur.code
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-bold text-sm block">{cur.symbol}</span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {cur.code} ({cur.label})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {/* Language toggle */}
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <Languages className="w-4 h-4 text-purple-600" />
                  <span>{isUrdu ? 'ایپلی کیشن کی زبان' : 'Application Language'}</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleInputChange('selected_language', 'en')}
                    className={`p-2.5 rounded-xl border font-medium transition text-center ${
                      formData.selected_language === 'en'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    English (Default)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('selected_language', 'ur')}
                    className={`p-2.5 rounded-xl border font-medium transition text-center ${
                      formData.selected_language === 'ur'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    اردو (Urdu)
                  </button>
                </div>
              </div>

              {/* Date & Time formats */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Date Format
                  </label>
                  <select
                    value={formData.date_format}
                    onChange={(e) => handleInputChange('date_format', e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Time Format
                  </label>
                  <select
                    value={formData.time_format}
                    onChange={(e) => handleInputChange('time_format', e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    <option value="12h">12-Hour (AM/PM)</option>
                    <option value="24h">24-Hour (Military)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DATA BACKUP & MAINTENANCE */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 md:p-6 shadow-xs">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            <Database className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold text-base text-slate-900 dark:text-white">
              {isUrdu ? '3. ڈیٹا بیک اپ اور بحالی' : '3. Data Backup, Restore & Demo Seed'}
            </h2>
          </div>

          <p className="text-xs text-slate-500 mb-4">
            {isUrdu
              ? 'اپنے تمام مرمتی ریکارڈز، گاہکوں اور ادائیگیاں محفوظ رکھیں یا کسی دوسری ڈیوائس پر منتقل کریں۔'
              : 'Export an encrypted offline JSON snapshot of all customers, repair jobs, and payments.'}
          </p>

          <input
            ref={restoreInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleRestoreFile}
            className="hidden"
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportBackup}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-medium transition flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 rotate-180" />
              <span>{isUrdu ? 'بیک اپ ڈاؤنلوڈ کریں (JSON)' : 'Export Backup File'}</span>
            </button>

            <button
              type="button"
              onClick={() => restoreInputRef.current?.click()}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'بیک اپ فائل بحال کریں' : 'Restore Backup File'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm('Load sample demonstration jobs and transactions?')) {
                  onResetDemo();
                }
              }}
              className="ml-auto px-3.5 py-2 text-blue-600 hover:text-blue-700 border border-blue-200 dark:border-blue-900 rounded-xl text-xs font-medium hover:bg-blue-50 transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'ڈیمو ڈیٹا دوبارہ لوڈ کریں' : 'Reload Demo Data'}</span>
            </button>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-3 bg-[#2C3E50] hover:bg-slate-800 text-white font-semibold rounded-xl shadow-xs transition"
          >
            {isUrdu ? 'ترتیبات محفوظ کریں' : 'Save Shop Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
