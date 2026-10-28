import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CivicMap } from '../components/map/CivicMap';
import { IssueCategory, IssueSeverity, DuplicateCandidate, RecurringIssue } from '../types';
import {
  ShieldAlert,
  MapPin,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';

const CATEGORIES: { value: IssueCategory; label: string }[] = [
  { value: 'pothole_roads', label: 'Potholes & Damaged Roads' },
  { value: 'garbage_accumulation', label: 'Garbage & Waste Accumulation' },
  { value: 'broken_streetlights', label: 'Broken or Flickering Streetlights' },
  { value: 'damaged_sidewalks', label: 'Damaged Sidewalks & Curbs' },
  { value: 'drainage_problems', label: 'Drainage & Stormwater Problems' },
  { value: 'water_infrastructure', label: 'Water Infrastructure & Leaks' },
  { value: 'other', label: 'Other Civic Problems' },
];

export const ReportIssuePage: React.FC = () => {
  const { user, showNotification } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IssueCategory>('pothole_roads');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<IssueSeverity>('medium');
  const [address, setAddress] = useState('420 Pine St & 5th Ave');
  const [landmark, setLandmark] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 47.6075,
    lng: -122.334,
  });

  // Photo state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Submitting state
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Duplicate / Recurring Warning Modal
  const [submissionResult, setSubmissionResult] = useState<{
    reportId: string;
    duplicates: DuplicateCandidate[];
    recurring?: RecurringIssue;
  } | null>(null);

  // Handle Photo selection with size & type validation
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image must be under 5 MB in size.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim() || !description.trim() || !address.trim()) {
      setErrorMessage('Please fill in all required fields (title, description, and location).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.submitReport({
        title,
        category,
        description,
        severity,
        location: {
          lat: coordinates.lat,
          lng: coordinates.lng,
          address,
          landmark: landmark || undefined,
        },
        photoUrl: photoPreview || undefined,
      });

      showNotification('Report submitted successfully! Stored permanently.', 'success');

      // If potential duplicates or recurring incident detected, show confirmation modal
      if ((res.duplicateCandidates && res.duplicateCandidates.length > 0) || res.recurringIncident) {
        setSubmissionResult({
          reportId: res.report.id,
          duplicates: res.duplicateCandidates || [],
          recurring: res.recurringIncident,
        });
      } else {
        navigate(`/reports/${res.report.id}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Report a Civic Problem</h1>
        <p className="text-xs text-slate-500 mt-1">
          Submit infrastructure complaints for municipal review. Each submission receives a unique auditable identifier.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            1. Problem Description
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Issue Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep pothole damaging tires near crosswalk"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Civic Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IssueCategory)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Perceived Hazard Severity <span className="text-red-500">*</span>
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as IssueSeverity)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="low">Low — Minor cosmetic or nuisance issue</option>
                <option value="medium">Medium — Standard maintenance needed</option>
                <option value="high">High — Poses vehicle or bicycle damage risk</option>
                <option value="critical">Critical — Immediate pedestrian safety / flood hazard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact observations (e.g., width of hole, active water flow, lane obstruction, or specific time of failure)..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Location Card with Interactive Leaflet Map Picker */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" /> 2. Incident Location & Map Pin
            </h2>
            <span className="text-[11px] text-slate-400">Click map to set exact pin</span>
          </div>

          <CivicMap
            isPickerMode={true}
            selectedLocation={coordinates}
            onSelectLocation={(loc) => setCoordinates(loc)}
            height="320px"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Street Address or Intersection <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 402 Main St, Downtown"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Landmark or Cross-street (Optional)
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. In front of Central Bakery, near pole #14"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Coordinate manual adjustment */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-[11px] text-slate-500">Latitude</label>
              <input
                type="number"
                step="0.000001"
                value={coordinates.lat}
                onChange={(e) =>
                  setCoordinates((prev) => ({ ...prev, lat: parseFloat(e.target.value) || prev.lat }))
                }
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs font-mono bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500">Longitude</label>
              <input
                type="number"
                step="0.000001"
                value={coordinates.lng}
                onChange={(e) =>
                  setCoordinates((prev) => ({ ...prev, lng: parseFloat(e.target.value) || prev.lng }))
                }
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs font-mono bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* Photograph Upload Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-slate-500" /> 3. Incident Photograph (Optional)
          </h2>

          <div className="flex flex-col sm:flex-row items-start gap-4">
            <label className="flex-1 w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <Upload className="w-6 h-6 text-slate-400 mb-2" />
              <span className="text-xs font-semibold text-slate-700">Choose photograph file</span>
              <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WebP up to 5MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>

            {photoPreview && (
              <div className="relative w-full sm:w-44 h-32 rounded-lg border border-slate-200 overflow-hidden bg-slate-100">
                <img
                  src={photoPreview}
                  alt="Incident preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  className="absolute top-1 right-1 px-1.5 py-0.5 bg-slate-900/70 text-white rounded text-[10px] hover:bg-slate-900"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {photoError && (
            <p className="text-xs text-red-600">{photoError}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying Duplicate & Submitting...
              </>
            ) : (
              <>
                Submit Report to Dispatch <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Duplicate / Recurring Warning Modal (Requirements 8.5 - 8.8) */}
      {submissionResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="p-4 bg-amber-50 border-b border-amber-200 flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-amber-900 text-sm">
                Report Submitted • Possible Related Incidents Detected
              </h3>
            </div>

            <div className="p-5 text-xs text-slate-600 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-semibold text-slate-800">Your Report ID:</span>{' '}
                <span className="font-mono text-blue-600 font-bold">{submissionResult.reportId}</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Your original report has been safely preserved in the database.
                </p>
              </div>

              {submissionResult.recurring && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    Possible Recurring Problem Detected!
                  </div>
                  <p className="text-[11px] text-red-700">
                    A previous incident at this location was resolved {submissionResult.recurring.daysSinceResolved} days ago ({submissionResult.recurring.distanceMeters}m away). Staff will investigate potential repeat infrastructure failure.
                  </p>
                </div>
              )}

              {submissionResult.duplicates.length > 0 && (
                <div>
                  <div className="font-semibold text-slate-800 mb-2">
                    {submissionResult.duplicates.length} Similar Active Report(s) Found Nearby:
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {submissionResult.duplicates.map((dup) => (
                      <div
                        key={dup.id}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span>{dup.primaryReport?.title || 'Active Complaint'}</span>
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono">
                            {dup.compositeScore}% similarity
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Distance: {dup.distanceMeters} meters away • Category: {dup.primaryReport?.category}
                        </div>
                        <p className="text-[11px] text-slate-600 italic mt-1 border-t border-slate-200/60 pt-1">
                          {dup.aiExplanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-slate-500 leading-relaxed text-[11px]">
                Municipal staff will review these matches in the Duplicate Review Queue. If grouped, your original report remains accessible and increases the incident's priority.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate(`/reports/${submissionResult.reportId}`)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors"
                >
                  View My Submitted Report →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
