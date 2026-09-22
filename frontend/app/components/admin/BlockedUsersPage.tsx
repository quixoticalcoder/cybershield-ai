"use client";

import React from "react";

interface BlockedUsersPageProps {
  evidenceList: any[];
}

export default function BlockedUsersPage({
  evidenceList,
}: BlockedUsersPageProps) {

  const blockedUsers = evidenceList.filter(
    (e: any) => e.status === "Blocked"
  );

  return (

    <div className="space-y-8">

      {/* Header */}

      <div>

        <h1 className="text-4xl font-bold text-gray-900">
          Blocked Users
        </h1>

        <p className="mt-2 text-lg text-gray-500">
          Users permanently or temporarily blocked by cybershield-ai.
        </p>

      </div>

      {/* Summary */}

      <div
        className="
          rounded-[28px]
          bg-gradient-to-r
          from-red-600
          to-red-500
          text-white
          p-8
          shadow-xl
        "
      >

        <h2 className="text-3xl font-bold">
          {blockedUsers.length} Blocked Users
        </h2>

        <p className="mt-3 text-red-100">
          These accounts have been blocked by administrators.
        </p>

      </div>

      {/* Empty State */}

      {blockedUsers.length === 0 && (

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
            No Blocked Users
          </h2>

          <p className="mt-3 text-gray-500">
            No users are currently blocked.
          </p>

        </div>

      )}

      {/* Blocked Users */}

      {blockedUsers.length > 0 && (

        <div className="space-y-6">

  {blockedUsers.map((user: any, index: number) => (

    <div
      key={index}
      className="
        bg-white
        rounded-[28px]
        shadow-md
        border
        border-red-100
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
            {user.sender}
          </h2>

          <p className="mt-1 text-gray-500">
            Blocked after repeated cyberbullying detection
          </p>

        </div>

        <span
          className="
            px-4
            py-2
            rounded-full
            bg-red-100
            text-red-600
            text-sm
            font-semibold
          "
        >
          BLOCKED
        </span>

      </div>

      {/* Details */}

      <div className="grid grid-cols-2 gap-8 p-8">

        <div>

          <p className="text-sm text-gray-500">
            Target User
          </p>

          <p className="mt-2 text-lg font-semibold">
            {user.receiver}
          </p>

        </div>

        <div>

          <p className="text-sm text-gray-500">
            Strike Count
          </p>

          <p className="mt-2 text-lg font-semibold">
            {user.strikes}
          </p>

        </div>

        <div>

          <p className="text-sm text-gray-500">
            AI Result
          </p>

          <p className="mt-2 text-lg">
            {user.ai_result}
          </p>

        </div>

        <div>

          <p className="text-sm text-gray-500">
            Evidence Type
          </p>

          <p className="mt-2 text-lg">
            {user.evidence_type}
          </p>

        </div>

      </div>

      {/* Footer */}

      <div
        className="
          px-8
          pb-8
          flex
          justify-end
        "
      >

        <span
          className="
            rounded-2xl
            bg-red-50
            text-red-600
            px-6
            py-3
            font-semibold
          "
        >
          Account Restricted
        </span>

      </div>

    </div>

  ))}

</div>

      )}

    </div>

  );

}