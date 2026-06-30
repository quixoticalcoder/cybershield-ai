"use client";

import React from "react";

interface ReportsPageProps {
  reports: any[];
  setReports: React.Dispatch<React.SetStateAction<any[]>>;
  onViewContext: (report: any) => void;
}

export default function ReportsPage({
  reports,
  setReports,
  onViewContext,
}: ReportsPageProps) {

  return (

    <div className="space-y-8">

      {/* Header */}

      <div>

        <h1 className="text-4xl font-bold text-gray-900">
          User Reports
        </h1>

        <p className="mt-2 text-lg text-gray-500">
          Review reports submitted by users and take moderation actions.
        </p>

      </div>

      {/* Summary */}

      <div
        className="
          rounded-[28px]
          bg-gradient-to-r
          from-indigo-600
          to-blue-600
          text-white
          p-8
          shadow-xl
        "
      >

        <h2 className="text-3xl font-bold">
          {reports.length} Reports Submitted
        </h2>

        <p className="mt-3 text-blue-100">
          Every report submitted by users appears here for administrator review.
        </p>

      </div>

      {/* Empty State */}

      {reports.length === 0 && (

        <div
          className="
            bg-white
            rounded-[28px]
            shadow-md
            p-14
            text-center
          "
        >

          <h2 className="text-2xl font-bold text-gray-900">
            No Reports Found
          </h2>

          <p className="mt-3 text-gray-500">
            Users haven't submitted any reports yet.
          </p>

        </div>

      )}

      {/* Reports */}

      {reports.length > 0 && (

        <div className="space-y-6">

  {reports.map((report: any, index: number) => (

    <div
      key={index}
      className="
        bg-white
        rounded-[28px]
        shadow-md
        border
        border-gray-100
        hover:shadow-xl
        transition-all
        duration-300
      "
    >

      {/* Card Header */}

      <div
        className="
          flex
          items-center
          justify-between
          p-8
          border-b
          border-gray-100
        "
      >

        <div>

          <h2 className="text-2xl font-bold text-gray-900">
            {report.reported_user}
          </h2>

          <p className="mt-1 text-gray-500">
            Reported by {report.reporter_user}
          </p>

        </div>

        <span
          className={`
            px-4
            py-2
            rounded-full
            text-sm
            font-semibold

            ${
              report.status === "Reviewed"
                ? "bg-green-100 text-green-700"
                : report.status === "Dismissed"
                ? "bg-gray-100 text-gray-700"
                : "bg-yellow-100 text-yellow-700"
            }
          `}
        >
          {report.status}
        </span>

      </div>

      {/* Details */}

      <div className="p-8 grid grid-cols-2 gap-8">

        <div>

          <p className="text-sm text-gray-500">
            Reason
          </p>

          <p className="mt-2 text-lg font-semibold">
            {report.reason}
          </p>

        </div>

        <div>

          

        </div>

        <div className="col-span-2">

          <p className="text-sm text-gray-500">
            Reported Message
          </p>

          <p className="mt-2 text-lg">
            {report.reported_message}
          </p>

        </div>

        <div className="col-span-2">

          <p className="text-sm text-gray-500">
            Description
          </p>

          <p className="mt-2">
            {report.description}
          </p>

        </div>

      </div>

      {/* Actions */}

      <div
  className="
    flex
    gap-4
    flex-wrap
    px-8
    pb-8
  "
>

  <button
    onClick={async () => {

      await fetch(
        `http://127.0.0.1:8000/report/${report.id}/status?status=Reviewed`,
        {
          method: "PUT",
        }
      );

      setReports((prev) =>
        prev.map((r: any) =>
          r.id === report.id
            ? { ...r, status: "Reviewed" }
            : r
        )
      );

    }}
    className="
      rounded-2xl
      bg-green-100
      text-green-700
      px-6
      py-3
      font-semibold
      hover:bg-green-200
      transition-all
      duration-200
    "
  >
    Review
  </button>

  <button
    onClick={async () => {

      await fetch(
        `http://127.0.0.1:8000/report/${report.id}/status?status=Dismissed`,
        {
          method: "PUT",
        }
      );

      setReports((prev) =>
        prev.map((r: any) =>
          r.id === report.id
            ? { ...r, status: "Dismissed" }
            : r
        )
      );

    }}
    className="
      rounded-2xl
      bg-gray-100
      text-gray-700
      px-6
      py-3
      font-semibold
      hover:bg-gray-200
      transition-all
      duration-200
    "
  >
    Dismiss
  </button>

  <button
    onClick={() => onViewContext(report)}
    className="
      rounded-2xl
      bg-blue-600
      text-white
      px-6
      py-3
      font-semibold
      hover:bg-blue-700
      transition-all
      duration-200
    "
  >
    View Context
  </button>

</div>
    </div>

  ))}

</div>

      )}

    </div>

  );

}