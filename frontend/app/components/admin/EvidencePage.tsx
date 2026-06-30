"use client";

import React from "react";

interface EvidencePageProps {
  evidenceList: any[];
  onViewEvidence: (evidence: any) => void;
}

export default function EvidencePage({
  evidenceList,
  onViewEvidence,
}: EvidencePageProps) {

  return (

    <div className="space-y-8">

      {/* Header */}

      <div>

        <h1 className="text-4xl font-bold text-gray-900">
          AI Evidence
        </h1>

        <p className="mt-2 text-lg text-gray-500">
          Review AI detected cyberbullying incidents and moderate users.
        </p>

      </div>

      {/* Summary Card */}

      <div
        className="
          rounded-[28px]
          bg-gradient-to-r
          from-blue-600
          to-indigo-600
          text-white
          p-8
          shadow-xl
        "
      >

        <h2 className="text-3xl font-bold">
          {evidenceList.length} Evidence Records
        </h2>

        <p className="mt-3 text-blue-100">
          Every AI detection appears here with moderation controls.
        </p>

      </div>

      {/* Empty State */}

      {evidenceList.length === 0 && (

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
            No AI Evidence Found
          </h2>

          <p className="text-gray-500 mt-3">
            CyberShield has not detected any harmful messages yet.
          </p>

        </div>

      )}

      {/* Evidence List */}

      {evidenceList.length > 0 && (

        <div className="space-y-6">

  {evidenceList.map((evidence: any, index: number) => (

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
            {evidence.sender}
          </h2>

          <p className="text-gray-500 mt-1">
            Target: {evidence.receiver}
          </p>

        </div>

        

      </div>

      {/* Details */}

      <div className="p-8 grid grid-cols-2 gap-8">

        <div>

          <p className="text-sm text-gray-500">
            AI Result
          </p>

          <p className="mt-2 text-lg font-semibold">
            {evidence.ai_result}
          </p>

        </div>

        <div>

          <p className="text-sm text-gray-500">
            Evidence Type
          </p>

          <p className="mt-2 text-lg font-semibold">
            {evidence.evidence_type}
          </p>

        </div>

        <div>

          <p className="text-sm text-gray-500">
            Strike Count
          </p>

          <p className="mt-2 text-lg font-semibold">
            {evidence.strikes}
          </p>

        </div>

        <div>

  <p className="text-sm text-gray-500">
    Evidence Details
  </p>

  <button
    onClick={() => onViewEvidence(evidence)}
    className="
      mt-2
      rounded-xl
      bg-blue-600
      text-white
      px-5
      py-2
      font-semibold
      hover:bg-blue-700
      transition
    "
  >
    View Evidence
  </button>

</div>

      </div>

      {/* Actions */}

     
    </div>

  ))}

</div>

      )}

    </div>

  );

}