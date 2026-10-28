import React, { useState, useEffect } from 'react';
import { StaffSidebar } from '../components/layout/StaffSidebar';
import { api } from '../services/api';
import { ApplicationSettings } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Settings,
  Sliders,
  Sparkles,
  RotateCcw,
  FileDown,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Layers,
} from 'lucide-react';
import { DownloadReportModal } from '../components/common/DownloadReportModal';

export const SettingsPage: React.FC = () => {
  const { user, showNotification } = useAuth();
  const [settings, setSettings] = useState<ApplicationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.getSettings();
        setSettings(res.settings);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      const res = await api.updateSettings(settings);
      setSettings(res.settings);
      showNotification('Settings and scoring parameters updated successfully!', 'success');
    } catch (e: any) {
      showNotification(e.message || 'Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDemo = async () => {
    if (!window.confirm('Reset all demonstration data to the baseline initial state? This reloads the 5-pothole cluster, recurring problem on Oak St, and overdue water main.')) {
      return;
    }
    setResetting(true);
    try {
      await api.resetDemoData();
      showNotification('Demonstration dataset reloaded successfully!', 'success');
      window.location.reload();
    } catch (e: any) {
      showNotification('Failed to reset demo data', 'error');
    } finally {
      setResetting(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex bg-[#F8FAFC]">
        <StaffSidebar />
        <main className="flex-1 p-8 text-center text-xs text-slate-500">Loading settings...</main>
      </div>
    );
  }

  return (
    <div className="flex bg-[#F8FAFC]">
      <StaffSidebar />

      <main className="flex-1 p-6 max-w-5xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-6 h-6 text-blue-600" /> Platform & Scoring Settings
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Configure priority calculation weights, duplicate match thresholds, and demonstration data.
            </p>
          </div>
          <button
            onClick={() => setReportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 shadow-2xs transition-colors self-start sm:self-auto"
          >
            <FileDown className="w-4 h-4 text-blue-600" /> Download Report (PDF)
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* 1. Priority Scoring Weights */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sliders className="w-4 h-4 text-blue-600" />
              <h2 className="font-bold text-slate-900 text-sm">
                1. Explainable Priority Scoring Weights (0–100 Scale)
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Adjust the contribution of each factor when computing the automated priority ranking for municipal work orders.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Base Severity Weight: {settings.scoringWeights.severityWeight}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={settings.scoringWeights.severityWeight}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      scoringWeights: {
                        ...settings.scoringWeights,
                        severityWeight: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Open Aging Time Weight: {settings.scoringWeights.timeOpenWeight}%
                </label>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={settings.scoringWeights.timeOpenWeight}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      scoringWeights: {
                        ...settings.scoringWeights,
                        timeOpenWeight: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Linked Reports Weight: {settings.scoringWeights.relatedReportsWeight}%
                </label>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={settings.scoringWeights.relatedReportsWeight}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      scoringWeights: {
                        ...settings.scoringWeights,
                        relatedReportsWeight: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Location Sensitivity: {settings.scoringWeights.locationWeight}%
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={settings.scoringWeights.locationWeight}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      scoringWeights: {
                        ...settings.scoringWeights,
                        locationWeight: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Recurring Failure Penalty: {settings.scoringWeights.recurringWeight}%
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={settings.scoringWeights.recurringWeight}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      scoringWeights: {
                        ...settings.scoringWeights,
                        recurringWeight: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-blue-600"
                />
              </div>
            </div>
          </div>

          {/* 2. Duplicate Detection Engine Thresholds */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h2 className="font-bold text-slate-900 text-sm">
                2. AI Duplicate Candidate Detection Parameters
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Distance Threshold for Duplicate Candidates (Meters)
                </label>
                <input
                  type="number"
                  min="20"
                  max="500"
                  value={settings.duplicateDistanceThresholdMeters}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      duplicateDistanceThresholdMeters: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Complaints within this geographic radius are evaluated for duplicate clustering.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Text Token Similarity Threshold (0.1 to 0.9)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="0.9"
                  value={settings.duplicateSimilarityThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      duplicateSimilarityThreshold: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Minimum normalized keyword overlap required for high-confidence match suggestions.
                </span>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.enableGeminiSemanticCheck}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      enableGeminiSemanticCheck: e.target.checked,
                    })
                  }
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold">
                  Enable Gemini 3.8 Flash Semantic AI Analysis (when API Key available)
                </span>
              </label>
            </div>
          </div>

          {/* 3. Recurring Issue Thresholds */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <RotateCcw className="w-4 h-4 text-red-600" />
              <h2 className="font-bold text-slate-900 text-sm">
                3. Recurring Issue Detection Rules
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Recurring Proximity Distance (Meters)
                </label>
                <input
                  type="number"
                  min="20"
                  max="300"
                  value={settings.recurringDistanceThresholdMeters}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      recurringDistanceThresholdMeters: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Historical Window (Days Since Resolution)
                </label>
                <input
                  type="number"
                  min="30"
                  max="365"
                  value={settings.recurringTimeWindowDays}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      recurringTimeWindowDays: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Settings...' : 'Save Configuration'}
            </button>
          </div>
        </form>

        {/* 4. Demonstration Seed Data Controls */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <RotateCcw className="w-4 h-4 text-slate-600" />
            <h2 className="font-bold text-slate-900 text-sm">
              4. Demonstration Dataset & QA Environment
            </h2>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Reload standard test scenarios:
            5 reports describing the same pothole on 4th & Main, commercial waste on Elm St, streetlight complaints on Park Ave, a recurring pothole on Oak St repaired 42 days ago, and an overdue critical water pipe fracture.
          </p>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              disabled={resetting}
              onClick={handleResetDemo}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200 transition-colors disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
              {resetting ? 'Resetting Database...' : 'Reload Standard Demonstration Data'}
            </button>
            <span className="text-[11px] text-slate-400">
              Overwrites current data with clean test scenarios
            </span>
          </div>
        </div>
      </main>

      <DownloadReportModal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} />
    </div>
  );
};
