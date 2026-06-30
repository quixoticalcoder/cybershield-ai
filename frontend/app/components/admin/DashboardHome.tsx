"use client";

import React from "react";

interface DashboardHomeProps {
  messages: any;
  users: any[];
  reports: any[];
  evidenceList: any[];

analysisHistory: any[];
  setAdminTab: React.Dispatch<React.SetStateAction<string>>;
}

export default function DashboardHome({
  messages,
  users,
  reports,
  evidenceList,

analysisHistory,
  setAdminTab,
}: DashboardHomeProps) {

  const totalAnalysedMessages = analysisHistory.length;

const totalEvidence = evidenceList.length;

const totalUsers = users.length;

const totalReports = reports.length;

// Only blocked evidence
const totalBlockedMessages = evidenceList.length;

  return (

    <div className="space-y-8">

      {/* Welcome */}

      <div
        className="
          rounded-[28px]
          bg-gradient-to-r
          from-blue-600
          to-indigo-600
          text-white
          p-10
          shadow-xl
        "
      >

        <h2 className="text-4xl font-bold">
          Dashboard
        </h2>

        <p className="text-blue-100 mt-3 text-lg max-w-3xl">
          Welcome to the CyberShield AI Administration Panel.
          Monitor conversations, review AI detections,
          manage reports and oversee platform activity.
        </p>

      </div>

      {/* Statistics */}

      <div
        className="
          grid
          grid-cols-4
          gap-6
        "
      >

              {/* Messages Analysed */}

<button
  onClick={() => setAdminTab("analysis")}
  className="
    bg-white
    rounded-[24px]
    p-7
    shadow-md
    hover:shadow-xl
    hover:-translate-y-1
    transition-all
    duration-300
    text-left
    border
    border-gray-100
  "
>

  <p className="text-sm text-gray-500">
    Messages Analysed
  </p>

  <h2 className="text-5xl font-bold text-gray-900 mt-3">
    {totalAnalysedMessages}
  </h2>

  <p className="text-blue-600 mt-4 font-semibold">
    View analysed messages →
  </p>

</button>
{/* AI Evidence */}

<button
  onClick={() => setAdminTab("evidence")}
  className="
    bg-white
    rounded-[24px]
    p-7
    shadow-md
    hover:shadow-xl
    hover:-translate-y-1
    transition-all
    duration-300
    text-left
    border
    border-gray-100
  "
>

  <p className="text-sm text-gray-500">
    AI Evidence
  </p>

  <h2 className="text-5xl font-bold text-red-600 mt-3">
  {totalBlockedMessages}
</h2>

  <p className="text-red-500 mt-4 font-semibold">
  Review blocked messages →
</p>

</button>

        {/* Active Users */}

        <button
          onClick={() => setAdminTab("users")}
          className="
            bg-white
            rounded-[24px]
            p-7
            shadow-md
            hover:shadow-xl
            hover:-translate-y-1
            transition-all
            duration-300
            text-left
            border
            border-gray-100
          "
        >

          <p className="text-sm text-gray-500">
            Active Users
          </p>

          <h2 className="text-5xl font-bold text-gray-900 mt-3">
            {totalUsers}
          </h2>

          <p className="text-green-600 mt-4 font-semibold">
            Open users →
          </p>

        </button>

        {/* Reports */}

        <button
          onClick={() => setAdminTab("reports")}
          className="
            bg-white
            rounded-[24px]
            p-7
            shadow-md
            hover:shadow-xl
            hover:-translate-y-1
            transition-all
            duration-300
            text-left
            border
            border-gray-100
          "
        >

          <p className="text-sm text-gray-500">
            Reports Received
          </p>

          <h2 className="text-5xl font-bold text-gray-900 mt-3">
            {totalReports}
          </h2>

          <p className="text-orange-500 mt-4 font-semibold">
            Open reports →
          </p>

        </button>

      </div>

      {/* Recent Activity */}

      <div className="grid grid-cols-2 gap-8">

              {/* Recent AI Activity */}

        <div
          className="
            bg-white
            rounded-[28px]
            border
            border-gray-100
            shadow-md
            p-8
          "
        >

          <div className="flex items-center justify-between mb-6">

            <h3 className="text-2xl font-bold text-gray-900">
              Recent AI Activity
            </h3>

            <button
              onClick={() => setAdminTab("evidence")}
              className="
                text-blue-600
                font-semibold
                hover:underline
              "
            >
              View All
            </button>

          </div>

          {evidenceList.length === 0 ? (

            <div className="text-gray-400 py-12 text-center">
              No AI detections available.
            </div>

          ) : (

            evidenceList.slice(0, 5).map((item: any, index: number) => (

              <div
                key={index}
                className="
                  flex
                  justify-between
                  items-center
                  py-4
                  border-b
                  last:border-none
                "
              >

                <div>

                  <p className="font-semibold text-gray-900">
                    {item.sender} → {item.receiver}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    {item.ai_result}
                  </p>

                </div>

                <span
                  className={`
                    px-3
                    py-1
                    rounded-full
                    text-sm
                    font-semibold

                    ${
                      item.status === "Blocked"
                        ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-700"
                    }
                  `}
                >
                  {item.status}
                </span>

              </div>

            ))

          )}

        </div>

        {/* Recent Reports */}

        <div
          className="
            bg-white
            rounded-[28px]
            border
            border-gray-100
            shadow-md
            p-8
          "
        >

          <div className="flex items-center justify-between mb-6">

            <h3 className="text-2xl font-bold text-gray-900">
              Recent Reports
            </h3>

            <button
              onClick={() => setAdminTab("reports")}
              className="
                text-blue-600
                font-semibold
                hover:underline
              "
            >
              View All
            </button>

          </div>

          {reports.length === 0 ? (

            <div className="text-gray-400 py-12 text-center">
              No reports submitted.
            </div>

          ) : (

            reports.slice(0, 5).map((report: any, index: number) => (

              <div
                key={index}
                className="
                  py-4
                  border-b
                  last:border-none
                "
              >

                <p className="font-semibold text-gray-900">
                  {report.reported_user}
                </p>

                <p className="text-gray-500 text-sm mt-1">
                  {report.reason}
                </p>

                <div className="mt-3">

                  <span
                    className="
                      bg-blue-50
                      text-blue-600
                      px-3
                      py-1
                      rounded-full
                      text-sm
                    "
                  >
                    {report.status}
                  </span>

                </div>

              </div>

            ))

          )}

        </div>
              </div>

    </div>

  );

}