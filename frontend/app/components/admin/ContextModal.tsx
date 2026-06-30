"use client";

import React from "react";

interface ContextModalProps {

  open: boolean;

  report: any;

  onClose: () => void;

}

export default function ContextModal({

  open,

  report,

  onClose,

}: ContextModalProps) {

  if (!open || !report) return null;
  const formatMessage = (msg: any) => {

  if (!msg) return "";

  return msg.message;
};
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
          w-[800px]
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
              Report Context
            </h2>

            <p className="mt-2 text-gray-500">
              Complete report information submitted by the user.
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
                Reporter
              </p>

              <p className="mt-2 text-lg font-semibold">
                {report.reporter_user}
              </p>

            </div>

            <div>

              <p className="text-sm text-gray-500">
                Reported User
              </p>

              <p className="mt-2 text-lg font-semibold">
                {report.reported_user}
              </p>

            </div>

            <div>

              <p className="text-sm text-gray-500">
                Reason
              </p>

              <p className="mt-2 text-lg font-semibold">
                {report.reason}
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

          </div>

          <div>

            <p className="text-sm text-gray-500">
              Reported Message
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
              {report.reported_message}
            </div>

          </div>

          <div>

            <p className="text-sm text-gray-500">
              Description
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
              {report.description || "No description provided."}
            </div>

          <div>

  <p className="text-sm text-gray-500">
    Conversation Context
  </p>

  <div
    className="
      mt-3
      rounded-2xl
      bg-gray-50
      border
      border-gray-200
      p-5
      space-y-4
    "
  >

    <div>

      <p className="font-semibold text-blue-600 mb-2">
        Messages Before
      </p>

      {Array.isArray(report.context_before) &&
      report.context_before.length > 0 ? (

        report.context_before.map(
          (msg: any, index: number) => (

            <div
              key={index}
              className="py-2 border-b border-gray-100"
            >
              <strong>{msg.sender}</strong>: {formatMessage(msg)}
            </div>

          )
        )

      ) : (

        <p className="text-gray-500">
          No previous messages.
        </p>

      )}

    </div>

    <div>

      <p className="font-semibold text-red-600 mb-2">
        Reported Message
      </p>

      <div className="font-medium">
        {report.reported_message}
      </div>

    </div>

    <div>

      <p className="font-semibold text-green-600 mb-2">
        Messages After
      </p>

      {Array.isArray(report.context_after) &&
      report.context_after.length > 0 ? (

        report.context_after.map(
          (msg: any, index: number) => (

            <div
              key={index}
              className="py-2 border-b border-gray-100"
            >
             <strong>{msg.sender}</strong>: {formatMessage(msg)}
            </div>

          )
        )

      ) : (

        <p className="text-gray-500">
          No later messages.
        </p>

      )}

    </div>

  </div>

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