"use client";

import React from "react";

interface AnalysisHistoryPageProps {
  analysisHistory: any[];
}

export default function AnalysisHistoryPage({
  analysisHistory,
}: AnalysisHistoryPageProps) {

  return (

    <div className="space-y-8">

      {/* Header */}

      <div>

        <h1 className="text-4xl font-bold text-gray-900">
          Messages Analysed
        </h1>

        <p className="mt-2 text-lg text-gray-500">
          Every message analysed by cybershield-ai is shown below.
        </p>

      </div>

      {/* Summary */}

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
          {analysisHistory.length} Messages Analysed
        </h2>

        <p className="mt-3 text-blue-100">
          Includes text, image OCR and voice transcription analysis.
        </p>

      </div>

      {/* Empty */}

      {analysisHistory.length === 0 && (

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
            No Messages Analysed
          </h2>

          <p className="mt-3 text-gray-500">
            Messages will appear here after AI analysis.
          </p>

        </div>

      )}

      {/* Cards */}

      {analysisHistory.length > 0 && (

        <div className="space-y-6">

          {analysisHistory.map((item: any, index: number) => (

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

              {/* Header */}

              <div
                className="
                  flex
                  justify-between
                  items-center
                  p-8
                  border-b
                  border-gray-100
                "
              >

                <div>

                  <h2 className="text-2xl font-bold text-gray-900">
                    {item.sender}
                  </h2>

                  <p className="mt-1 text-gray-500">
                    Receiver: {item.receiver}
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
                      item.analysis_result === "Bullying"
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-700"
                    }
                  `}
                >
                  {item.analysis_result}
                </span>

              </div>

              {/* Body */}

              <div className="grid grid-cols-2 gap-8 p-8">

                <div>

                  <p className="text-sm text-gray-500">
                    Evidence Type
                  </p>

                  <p className="mt-2 text-lg font-semibold">
                    {item.evidence_type}
                  </p>

                </div>

                <div>

                  <p className="text-sm text-gray-500">
                    Sender
                  </p>

                  <p className="mt-2 text-lg font-semibold">
                    {item.sender}
                  </p>

                </div>

                <div className="col-span-2">

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
                    {item.message}
                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}