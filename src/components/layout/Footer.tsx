import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileDown } from 'lucide-react';
import { DownloadReportModal } from '../common/DownloadReportModal';

export const Footer: React.FC = () => {
  const [reportModalOpen, setReportModalOpen] = useState(false);

  return (
    <>
      <footer className="bg-white border-t border-slate-200 mt-auto py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                CivicSignal Platform
              </div>
              <p className="max-w-md text-slate-500 leading-relaxed">
                AI-Powered civic issue detection, intelligent duplicate grouping, explainable priority scoring, and transparent SLA tracking for citizens and municipal civil engineers.
              </p>
            </div>

            <div>
              <div className="font-semibold text-slate-900 mb-2">Citizen Navigation</div>
              <ul className="space-y-1.5">
                <li>
                  <Link to="/report" className="hover:text-blue-600 transition-colors">
                    Report a Civic Problem
                  </Link>
                </li>
                <li>
                  <Link to="/map" className="hover:text-blue-600 transition-colors">
                    Interactive Civic Map
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-blue-600 transition-colors">
                    Citizen Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/my-reports" className="hover:text-blue-600 transition-colors">
                    My Submissions History
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="font-semibold text-slate-900 mb-2">Municipal Operations</div>
              <ul className="space-y-1.5">
                <li>
                  <Link to="/staff" className="hover:text-blue-600 transition-colors">
                    Staff Operations Command
                  </Link>
                </li>
                <li>
                  <Link to="/staff/duplicates" className="hover:text-blue-600 transition-colors">
                    Duplicate Review Queue
                  </Link>
                </li>
                <li>
                  <Link to="/staff/recurring" className="hover:text-blue-600 transition-colors">
                    Recurring Issue Detection
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setReportModalOpen(true)}
                    className="text-blue-600 font-medium hover:underline flex items-center gap-1"
                  >
                    <FileDown className="w-3.5 h-3.5" /> Download Report (PDF)
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
            <div>© {new Date().getFullYear()} CivicSignal Municipal Infrastructure System. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <span>Zero-Pill Minimal Theme</span>
              <span>•</span>
              <span>OpenStreetMap Engine</span>
              <span>•</span>
              <span>Gemini 3.8 Flash Semantic Grounding</span>
            </div>
          </div>
        </div>
      </footer>

      <DownloadReportModal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} />
    </>
  );
};
