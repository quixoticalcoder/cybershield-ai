"use client";

import React from "react";

interface UsersPageProps {
  users: any[];
}

export default function UsersPage({
  users,
}: UsersPageProps) {

  return (

    <div className="space-y-8">

      {/* Header */}

      <div>

        <h1 className="text-4xl font-bold text-gray-900">
          Users
        </h1>

        <p className="mt-2 text-lg text-gray-500">
          View every registered CyberShield user.
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
          {users.length} Registered Users
        </h2>

        <p className="mt-3 text-blue-100">
          Monitor all users currently available in the CyberShield platform.
        </p>

      </div>

      {/* Empty State */}

      {users.length === 0 && (

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
            No Users Found
          </h2>

          <p className="mt-3 text-gray-500">
            There are currently no registered users.
          </p>

        </div>

      )}

      {/* Users List */}

      {users.length > 0 && (

        <div className="space-y-6">

  {users.map((user: any, index: number) => (

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
            {user.username}
          </h2>
          <p className="mt-2 text-gray-500">
  Total Strikes: {user.strikes}
</p>
          <p className="mt-1 text-gray-500">
            Registered CyberShield User
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
  user.status === "Blocked"
    ? "bg-red-100 text-red-600"
    : "bg-green-100 text-green-700"
}
          `}
        >
          {user.status || "Active"}
        </span>

      </div>

      {/* Details */}

      <div className="grid grid-cols-2 gap-8 p-8">

        <div>

          <p className="text-sm text-gray-500">
            Username
          </p>

          <p className="mt-2 text-lg font-semibold">
            {user.username}
          </p>

        </div>

        <div>

          <p className="text-sm text-gray-500">
            Strike Count
          </p>

          <p className="mt-2 text-lg font-semibold">
            {user.strikes ?? 0}
          </p>

        </div>

        <div>

  <p className="text-sm text-gray-500">
    Account Status
  </p>

  <p className="mt-2 text-lg font-semibold">
    {user.status || "Active"}
  </p>

</div>

<div>

  <p className="text-sm text-gray-500">
    Actions
  </p>

  <div className="mt-3 flex gap-3">

    <button
      onClick={async () => {

        await fetch(
          `http://127.0.0.1:8000/user/${user.username}/block`,
          {
            method: "PUT",
          }
        );

      }}
      className="
        rounded-xl
        bg-red-600
        text-white
        px-5
        py-2
        font-semibold
        hover:bg-red-700
        transition
      "
    >
      Block
    </button>

    <button
      onClick={async () => {

        await fetch(
          `http://127.0.0.1:8000/user/${user.username}/unblock`,
          {
            method: "PUT",
          }
        );

      }}
      className="
        rounded-xl
        bg-green-600
        text-white
        px-5
        py-2
        font-semibold
        hover:bg-green-700
        transition
      "
    >
      Unblock
    </button>

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