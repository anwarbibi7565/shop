/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  RepairJob,
  ShopSettings as ShopSettingsType,
} from './types';
import { storageService } from './services/storage';
import { TRANSLATIONS } from './translations';
import { Dashboard } from './components/Dashboard';
import { AddCustomerJob } from './components/AddCustomerJob';
import { RepairHistory } from './components/RepairHistory';
import { PaymentsManager } from './components/PaymentsManager';
import { ReportsModule } from './components/ReportsModule';
import { ShopSettings } from './components/ShopSettings';
import { CustomerReceipt } from './components/CustomerReceipt';
import { DeliveryModal } from './components/DeliveryModal';
import { JobDetailModal } from './components/JobDetailModal';
import {
  LayoutDashboard,
  UserPlus,
  History,
  CreditCard,
  FileBarChart2,
  Settings,
  Languages,
  Moon,
  Sun,
  Plus,
  Smartphone,
} from 'lucide-react';

type TabType =
  | 'dashboard'
  | 'add_job'
  | 'history'
  | 'payments'
  | 'reports'
  | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [settings, setSettings] = useState<ShopSettingsType>(() =>
    storageService.getSettings()
  );

  // Filter pass-through for history screen
  const [historyFilter, setHistoryFilter] = useState<string>('all');

  // Modal states
  const [receiptJob, setReceiptJob] = useState<RepairJob | null>(null);
  const [deliveryJob, setDeliveryJob] = useState<RepairJob | null>(null);
  const [detailJob, setDetailJob] = useState<RepairJob | null>(null);

  // Sync dark mode class on HTML root
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const t = TRANSLATIONS[settings.selected_language] || TRANSLATIONS.en;
  const isUrdu = settings.selected_language === 'ur';

  // Toggle Language between English and Urdu
  const toggleLanguage = () => {
    const nextLang: 'en' | 'ur' = settings.selected_language === 'en' ? 'ur' : 'en';
    const updated: ShopSettingsType = { ...settings, selected_language: nextLang };
    setSettings(updated);
    storageService.saveSettings(updated);
  };

  // Toggle Dark/Light Theme
  const toggleTheme = () => {
    const nextTheme: 'light' | 'dark' = settings.theme === 'light' ? 'dark' : 'light';
    const updated: ShopSettingsType = { ...settings, theme: nextTheme };
    setSettings(updated);
    storageService.saveSettings(updated);
  };

  // Handlers for navigation from cards
  const handleCardClickFilter = (filterKey: string) => {
    setHistoryFilter(filterKey);
    setActiveTab('history');
  };

  const handleJobCreated = (job: RepairJob, openReceipt: boolean) => {
    if (openReceipt) {
      setReceiptJob(job);
    }
  };

  return (
    <div
      dir={isUrdu ? 'rtl' : 'ltr'}
      className={`min-h-screen bg-[#EEF6FC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150 ${
        isUrdu ? 'lang-ur' : ''
      }`}
    >
      {/* TOP BAR CONTRACT: Brand Wordmark - Nav Links - Primary CTA (no-print) */}
      <header className="no-print sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6 sm:gap-8">
          {/* Zone 1: Brand Wordmark (Single element) */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left text-slate-900 dark:text-white font-bold text-lg tracking-tight whitespace-nowrap shrink-0 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#2C3E50] text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
              <Smartphone className="w-4 h-4 text-blue-400" />
            </div>
            <span className="hidden sm:inline font-bold">
              {settings.shop_name.length > 25
                ? settings.shop_name.slice(0, 25) + '...'
                : settings.shop_name}
            </span>
            <span className="sm:hidden font-bold">MRSM</span>
          </button>

          {/* Zone 2: Navigation Links (Single-line, whitespace-nowrap) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {[
              { id: 'dashboard', label: isUrdu ? 'ڈیش بورڈ' : 'Dashboard', icon: LayoutDashboard },
              { id: 'add_job', label: isUrdu ? 'نیا کام' : 'Add Job', icon: UserPlus },
              { id: 'history', label: isUrdu ? 'مرمت کی تفصیل' : 'History', icon: History },
              { id: 'payments', label: isUrdu ? 'ادائیگیاں' : 'Payments', icon: CreditCard },
              { id: 'reports', label: isUrdu ? 'رپورٹس' : 'Reports', icon: FileBarChart2 },
              { id: 'settings', label: isUrdu ? 'ترتیبات' : 'Settings', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'history') setHistoryFilter('all');
                    setActiveTab(item.id as TabType);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action & Quick Utilities */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
              title="Toggle Language"
            >
              <Languages className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{isUrdu ? 'English' : 'اردو'}</span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
              title="Toggle theme"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => setActiveTab('add_job')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2C3E50] hover:bg-slate-800 text-white font-medium text-xs rounded-xl shadow-xs transition cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isUrdu ? 'نیا موبائل' : 'New Job'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            settings={settings}
            onNavigateNewJob={() => setActiveTab('add_job')}
            onNavigateHistoryWithFilter={handleCardClickFilter}
            onNavigatePayments={() => setActiveTab('payments')}
            onSelectJob={(job) => setDetailJob(job)}
            onOpenReceipt={(job) => setReceiptJob(job)}
          />
        )}

        {activeTab === 'add_job' && (
          <AddCustomerJob
            settings={settings}
            onJobCreated={handleJobCreated}
            onNavigateHistory={() => {
              setHistoryFilter('all');
              setActiveTab('history');
            }}
          />
        )}

        {activeTab === 'history' && (
          <RepairHistory
            settings={settings}
            initialFilter={historyFilter}
            onSelectJob={(job) => setDetailJob(job)}
            onOpenReceipt={(job) => setReceiptJob(job)}
            onOpenDelivery={(job) => setDeliveryJob(job)}
            onNavigateNewJob={() => setActiveTab('add_job')}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentsManager
            settings={settings}
            onSelectJob={(job) => setDetailJob(job)}
          />
        )}

        {activeTab === 'reports' && <ReportsModule settings={settings} />}

        {activeTab === 'settings' && (
          <ShopSettings
            settings={settings}
            onSettingsUpdated={(newSettings) => setSettings(newSettings)}
            onResetDemo={() => {
              storageService.resetToDemo();
              setSettings(storageService.getSettings());
              setActiveTab('dashboard');
            }}
          />
        )}
      </main>

      {/* FIXED MOBILE BOTTOM TAB BAR (Thumb zone touch target >= 44px, no-print) */}
      <div className="no-print md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg">
        <div className="grid grid-cols-6 h-14 items-center">
          {[
            { id: 'dashboard', label: isUrdu ? 'ہوم' : 'Home', icon: LayoutDashboard },
            { id: 'add_job', label: isUrdu ? 'نیا' : 'New', icon: UserPlus },
            { id: 'history', label: isUrdu ? 'فہرست' : 'Jobs', icon: History },
            { id: 'payments', label: isUrdu ? 'رقم' : 'Pay', icon: CreditCard },
            { id: 'reports', label: isUrdu ? 'رپورٹ' : 'Reports', icon: FileBarChart2 },
            { id: 'settings', label: isUrdu ? 'سیٹنگ' : 'Setup', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'history') setHistoryFilter('all');
                  setActiveTab(tab.id as TabType);
                }}
                className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Customer Receipt Modal */}
      {receiptJob && (
        <CustomerReceipt
          job={receiptJob}
          settings={settings}
          payments={storageService.getPaymentsForJob(receiptJob.job_id)}
          onClose={() => setReceiptJob(null)}
        />
      )}

      {/* 2. Customer Delivery Modal */}
      {deliveryJob && (
        <DeliveryModal
          job={deliveryJob}
          settings={settings}
          onClose={() => setDeliveryJob(null)}
          onDelivered={() => {
            setDeliveryJob(null);
            // Refresh detail or trigger re-render
            const fresh = storageService.getJobs().find((j) => j.job_id === deliveryJob.job_id);
            if (fresh) setDetailJob(fresh);
          }}
        />
      )}

      {/* 3. Job Detail Modal */}
      {detailJob && (
        <JobDetailModal
          job={detailJob}
          settings={settings}
          onClose={() => setDetailJob(null)}
          onUpdated={() => {
            const fresh = storageService.getJobs().find((j) => j.job_id === detailJob.job_id);
            if (fresh) {
              setDetailJob(fresh);
            } else {
              setDetailJob(null);
            }
          }}
          onOpenReceipt={() => {
            setReceiptJob(detailJob);
          }}
          onOpenDelivery={() => {
            setDeliveryJob(detailJob);
          }}
        />
      )}
    </div>
  );
}
