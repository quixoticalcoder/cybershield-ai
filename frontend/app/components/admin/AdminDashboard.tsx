"use client";

import React from "react";

import { useState } from "react";
import EvidenceModal from "./EvidenceModal";
import ContextModal from "./ContextModal";
import AdminSidebar from "./AdminSidebar";
import DashboardHome from "./DashboardHome";
import EvidencePage from "./EvidencePage";
import ReportsPage from "./ReportsPage";
import UsersPage from "./UsersPage";
import AnalysisHistoryPage from "./AnalysisHistoryPage";
import SettingsPage from "./SettingsPage";
interface AdminDashboardProps {

  adminTab: string;
  setAdminTab: React.Dispatch<React.SetStateAction<string>>;

  messages: Record<string, any[]>;

  users: any[];

  reports: any[];
  setReports: React.Dispatch<React.SetStateAction<any[]>>;

  evidenceList: any[];

analysisHistory: any[];

  onLogout: () => void;
  onAddAccount: () => void;

  onViewEvidence: (evidence: any) => void;

  onViewContext: (report: any) => void;

  

}

export default function AdminDashboard({

  adminTab,
  setAdminTab,

  messages,

  users,

  reports,
  setReports,

  evidenceList,

analysisHistory,

  onLogout,
onAddAccount,

onViewEvidence,

onViewContext,


}: AdminDashboardProps) {
    const [showEvidence, setShowEvidence] = useState(false);
const [selectedEvidence, setSelectedEvidence] = useState<any>(null);

const [showContextModal, setShowContextModal] = useState(false);
const [selectedReport, setSelectedReport] = useState<any>(null);

  return (

    <div
  className="
    w-screen
    h-screen
    flex
    bg-gray-100
  "
>

      <div
  className="
    w-full
    h-full
    bg-white
    flex
    overflow-hidden
  "
>
        

        {/* Sidebar */}

        <AdminSidebar

          adminTab={adminTab}
          setAdminTab={setAdminTab}

          onLogout={onLogout}
          onAddAccount={onAddAccount}

        />

        {/* Right Side */}

        <div
  className="
    flex-1
    h-full
    bg-gray-50
    overflow-y-auto
  "
>

          {/* Header */}

          <div
            className="
              px-10
              py-8
              border-b
              border-gray-200
              bg-white
            "
          >

            <h1 className="text-3xl font-bold text-gray-900">
              cybershield-ai
            </h1>

            <p className="text-gray-500 mt-2">
              Administration Panel
            </p>

          </div>

          {/* Dynamic Content */}

          <div className="p-10 h-full">

                        {adminTab === "" && (

              <DashboardHome
  key={`${evidenceList.length}-${reports.length}-${analysisHistory.length}-${users.length}`}

  messages={messages}

  users={users}

  reports={reports}

  evidenceList={evidenceList}

  analysisHistory={analysisHistory}

  setAdminTab={setAdminTab}
/>

            )}

            {adminTab === "evidence" && (

              <EvidencePage

  evidenceList={evidenceList}

  onViewEvidence={(evidence) => {

    setSelectedEvidence(evidence);

    setShowEvidence(true);

  }}

/>

            )}

            {adminTab === "reports" && (

              <ReportsPage

  reports={reports}

  setReports={setReports}

  onViewContext={async (report) => {

    const response = await fetch(
        `http://127.0.0.1:8000/report-context/${report.id}`
    );

    const context = await response.json();

    setSelectedReport({

        ...report,

        context_before: context.context_before,

        context_after: context.context_after,

        reported_message: context.reported_message

    });

    setShowContextModal(true);

}}

/>

            )}

            {adminTab === "users" && (

              <UsersPage

                users={users}

              />

            )}

            {adminTab === "analysis" && (

  <AnalysisHistoryPage

    analysisHistory={analysisHistory}

  />

)}

            {adminTab === "settings" && (

              <SettingsPage

                onAddAccount={onAddAccount}

                onLogout={onLogout}

              />

            )}
                      </div>

        </div>

      </div>
            <EvidenceModal
        open={showEvidence}
        evidence={selectedEvidence}
        onClose={() => {
          setShowEvidence(false);
          setSelectedEvidence(null);
        }}
      />

      <ContextModal
        open={showContextModal}
        report={selectedReport}
        onClose={() => {
          setShowContextModal(false);
          setSelectedReport(null);
        }}
      />
    </div>

  );

}