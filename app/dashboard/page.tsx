'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { PINLock } from '@/components/dashboard/PINLock';
import { SessionDetail } from '@/components/dashboard/SessionDetail';
import { WeeklyChart } from '@/components/dashboard/WeeklyChart';
import { InsightsPanel } from '@/components/dashboard/InsightsPanel';
import { useStorage } from '@/hooks/useStorage';
import { useSettings } from '@/hooks/useSettings';
import { formatDisplayDate, getTodayDate } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { todayProgress, weeklyProgress, streak, isLoading, refresh } =
    useStorage();
  const { settings, verifyPIN } = useSettings();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPINModal, setShowPINModal] = useState(true);
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'insights'>(
    'today'
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePINSuccess = () => {
    setIsAuthenticated(true);
    setShowPINModal(false);
  };

  const handlePINCancel = () => {
    router.push('/');
  };

  if (!mounted) {
    return null;
  }

  // Show PIN lock if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <PINLock
          isOpen={showPINModal}
          onSuccess={handlePINSuccess}
          onCancel={handlePINCancel}
          verifyPIN={verifyPIN}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const todayAttempts = todayProgress?.attempts ?? [];

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      {/* Header */}
      <motion.div
        className="flex justify-between items-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Parent Dashboard
          </h1>
          <p className="text-text-secondary">
            {formatDisplayDate(new Date())}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/settings')}
          >
            Settings
          </Button>
          <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
            Back
          </Button>
        </div>
      </motion.div>

      {/* Tab navigation */}
      <motion.div
        className="flex gap-2 mb-6 overflow-x-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {[
          { id: 'today' as const, label: "Today's Session" },
          { id: 'week' as const, label: 'This Week' },
          { id: 'insights' as const, label: 'Insights' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'bg-white text-text-secondary hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {activeTab === 'today' && (
          <SessionDetail
            attempts={todayAttempts}
            date={formatDisplayDate(getTodayDate())}
          />
        )}

        {activeTab === 'week' && (
          <WeeklyChart weeklyProgress={weeklyProgress} streak={streak} />
        )}

        {activeTab === 'insights' && (
          <InsightsPanel weeklyProgress={weeklyProgress} />
        )}
      </motion.div>

      {/* Quick stats footer */}
      <motion.div
        className="mt-6 p-4 bg-white rounded-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex justify-between text-sm">
          <div>
            <span className="text-text-secondary">Child: </span>
            <span className="text-text-primary font-medium">
              {settings.childName}
            </span>
          </div>
          <div>
            <span className="text-text-secondary">Daily goal: </span>
            <span className="text-text-primary font-medium">
              {settings.promptsPerSession} prompts
            </span>
          </div>
          <button
            onClick={refresh}
            className="text-primary hover:underline"
          >
            Refresh
          </button>
        </div>
      </motion.div>
    </div>
  );
}
