"use client";

import React from "react";

interface EvidenceModalProps {

  open: boolean;

  evidence: any;

  onClose: () => void;

}

export default function EvidenceModal({

  open,

  evidence,

  onClose,

}: EvidenceModalProps) {

  if (!open || !evidence) return null;

  return (

    <div
      className="
        fixed
        inset-0
        bg-black/50
        flex
        items-center
        justify-center
        z-[100]
      "
    >

      <div
        className="
          w-[750px]
          max-h-[85vh]
          overflow-y-auto
          bg-white
          rounded-[30px]
          shadow-2xl
        "
      >

        {/* Header */}

        <div
          className="
            flex
            justify-between
            items-center
            p-8
            border-b
            border-gray-200
          "
        >

          <div>

            <h2 className="text-3xl font-bold text-gray-900">
              AI Evidence
            </h2>

            <p className="mt-2 text-gray-500">
              Complete AI moderation details
            </p>

          </div>

          <button
            onClick={onClose}
            className="
              text-2xl
              font-bold
              text-gray-400
              hover:text-gray-700
              transition
            "
          >
            ✕
          </button>

        </div>

        {/* Body */}

        <div className="p-8 space-y-8">
                      <div className="grid grid-cols-2 gap-8">

            <div>

              <p className="text-sm text-gray-500">
                Sender
              </p>

              <p className="mt-2 text-lg font-semibold">
                {evidence.sender}
              </p>

            </div>

            <div>

              <p className="text-sm text-gray-500">
                Receiver
              </p>

              <p className="mt-2 text-lg font-semibold">
                {evidence.receiver}
              </p>

            </div>

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
                Status
              </p>

              <span
                className={`
                  inline-block
                  mt-2
                  px-4
                  py-2
                  rounded-full
                  text-sm
                  font-semibold
                  ${
                    evidence.status === "Blocked"
                      ? "bg-red-100 text-red-600"
                      : "bg-yellow-100 text-yellow-700"
                  }
                `}
              >
                {evidence.status}
              </span>

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
                Evidence Type
              </p>

              <p className="mt-2 text-lg font-semibold">
                {evidence.evidence_type}
              </p>

            </div>

          </div>

          <div>

            <p className="text-sm text-gray-500">
              Original Message
            </p>

            <div
              className="
                mt-3
                rounded-2xl
                bg-gray-50
                border
                border-gray-200
                p-5
                whitespace-pre-wrap
              "
            >
              {evidence.message || "No message available"}
            </div>

          </div>

          <div className="flex justify-end">

            <button
              onClick={onClose}
              className="
                rounded-2xl
                bg-blue-600
                text-white
                px-8
                py-3
                font-semibold
                hover:bg-blue-700
                transition-all
                duration-200
              "
            >
              Close
            </button>

          </div>

        </div>

      </div>

    </div>

  );

}