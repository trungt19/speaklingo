'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { PINLock } from '@/components/dashboard/PINLock';
import { useSettings } from '@/hooks/useSettings';

export default function SettingsPage() {
  const router = useRouter();
  const { settings, updateSettings, reset, verifyPIN, isLoading } =
    useSettings();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPINModal, setShowPINModal] = useState(true);
  const [showChangePIN, setShowChangePIN] = useState(false);
  const [newPIN, setNewPIN] = useState('');
  const [confirmPIN, setConfirmPIN] = useState('');
  const [pinError, setPinError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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

  const handleSave = async (updates: Parameters<typeof updateSettings>[0]) => {
    setIsSaving(true);
    try {
      await updateSettings(updates);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePIN = async () => {
    if (newPIN.length !== 4) {
      setPinError('PIN must be 4 digits');
      return;
    }
    if (newPIN !== confirmPIN) {
      setPinError('PINs do not match');
      return;
    }
    await handleSave({ parentPIN: newPIN });
    setShowChangePIN(false);
    setNewPIN('');
    setConfirmPIN('');
    setPinError('');
  };

  const handleReset = async () => {
    await reset();
    setShowResetConfirm(false);
  };

  if (!mounted) {
    return null;
  }

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
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      {/* Header */}
      <motion.div
        className="flex justify-between items-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
          Back
        </Button>
      </motion.div>

      <div className="space-y-6 max-w-2xl">
        {/* Child Profile */}
        <Card>
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Child Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-text-secondary mb-2">
                Name
              </label>
              <input
                type="text"
                value={settings.childName}
                onChange={(e) => handleSave({ childName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </Card>

        {/* Session Settings */}
        <Card>
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Session Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-text-secondary mb-2">
                Prompts per session: {settings.promptsPerSession}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={settings.promptsPerSession}
                onChange={(e) =>
                  handleSave({ promptsPerSession: parseInt(e.target.value) })
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-text-secondary">
                <span>1</span>
                <span>5</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-primary">Require typing first</p>
                <p className="text-sm text-text-secondary">
                  Child must type before speaking
                </p>
              </div>
              <button
                onClick={() =>
                  handleSave({ requireTyping: !settings.requireTyping })
                }
                className={`w-12 h-7 rounded-full transition-colors ${
                  settings.requireTyping ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    settings.requireTyping ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2">
                Prompt Difficulty
              </label>
              <div className="flex gap-2">
                {[
                  { value: 1, label: 'Easy' },
                  { value: 2, label: 'Medium' },
                  { value: 3, label: 'All' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      handleSave({
                        promptDifficulty: option.value as 1 | 2 | 3,
                      })
                    }
                    className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                      settings.promptDifficulty === option.value
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Accessibility */}
        <Card>
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Accessibility
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-primary">Animations</p>
                <p className="text-sm text-text-secondary">
                  Gentle animations during app use
                </p>
              </div>
              <button
                onClick={() =>
                  handleSave({ animationsEnabled: !settings.animationsEnabled })
                }
                className={`w-12 h-7 rounded-full transition-colors ${
                  settings.animationsEnabled ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    settings.animationsEnabled
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2">
                Text Size
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'normal', label: 'Normal' },
                  { value: 'large', label: 'Large' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      handleSave({
                        textSize: option.value as 'normal' | 'large',
                      })
                    }
                    className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                      settings.textSize === option.value
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card>
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Security
          </h2>
          <Button
            variant="secondary"
            onClick={() => setShowChangePIN(true)}
            className="w-full"
          >
            Change PIN
          </Button>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <h2 className="text-lg font-semibold text-red-500 mb-4">
            Reset
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            Reset all settings to defaults. This will not delete session data.
          </p>
          <Button
            variant="ghost"
            onClick={() => setShowResetConfirm(true)}
            className="text-red-500 hover:bg-red-50"
          >
            Reset to Defaults
          </Button>
        </Card>
      </div>

      {/* Change PIN Modal */}
      <Modal
        isOpen={showChangePIN}
        onClose={() => setShowChangePIN(false)}
      >
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Change PIN
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">
              New PIN
            </label>
            <input
              type="password"
              maxLength={4}
              value={newPIN}
              onChange={(e) => setNewPIN(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none text-center text-2xl tracking-widest"
              placeholder="----"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Confirm PIN
            </label>
            <input
              type="password"
              maxLength={4}
              value={confirmPIN}
              onChange={(e) => setConfirmPIN(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none text-center text-2xl tracking-widest"
              placeholder="----"
            />
          </div>
          {pinError && (
            <p className="text-red-500 text-sm">{pinError}</p>
          )}
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setShowChangePIN(false);
                setNewPIN('');
                setConfirmPIN('');
                setPinError('');
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleChangePIN}
              className="flex-1"
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
      >
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Reset Settings?
        </h2>
        <p className="text-text-secondary mb-6">
          This will reset all settings to their default values. Your session
          history will not be affected.
        </p>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={() => setShowResetConfirm(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleReset}
            className="flex-1 bg-red-500 hover:bg-red-600"
          >
            Reset
          </Button>
        </div>
      </Modal>
    </div>
  );
}
