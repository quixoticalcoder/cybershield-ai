"use client";

import React from "react";

interface SettingsPageProps {
  onAddAccount: () => void;
  onLogout: () => void;
}

export default function SettingsPage({
  onAddAccount,
  onLogout,
}: SettingsPageProps) {

  return (

    <div className="space-y-8">

      {/* Header */}

      <div>

        <h1 className="text-4xl font-bold text-gray-900">
          Settings
        </h1>

        <p className="mt-2 text-lg text-gray-500">
          Manage administrator accounts and session settings.
        </p>

      </div>

      {/* Settings Card */}

      <div
        className="
          bg-white
          rounded-[28px]
          shadow-md
          border
          border-gray-100
          p-10
        "
      >

        <h2 className="text-2xl font-bold text-gray-900">
          Administrator Controls
        </h2>

        <p className="mt-3 text-gray-500">
          Manage administrator access and securely end the current session.
        </p>

        <div
  className="
    mt-10
    grid
    grid-cols-2
    gap-6
  "
>

  {/* Add Admin */}

  <div
    className="
      rounded-[24px]
      border
      border-blue-100
      bg-blue-50
      p-8
    "
  >

    <h3 className="text-xl font-bold text-gray-900">
      Add Administrator
    </h3>

    <p className="mt-3 text-gray-600">
      Register another administrator to securely manage cybershield-ai.
    </p>

    <button
      onClick={onAddAccount}
      className="
        mt-8
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
      Add Account
    </button>

  </div>

  {/* Logout */}

  <div
    className="
      rounded-[24px]
      border
      border-red-100
      bg-red-50
      p-8
    "
  >

    <h3 className="text-xl font-bold text-gray-900">
      Logout
    </h3>

    <p className="mt-3 text-gray-600">
      End your administrator session securely and return to the login screen.
    </p>

    <button
      onClick={onLogout}
      className="
        mt-8
        rounded-2xl
        bg-red-600
        text-white
        px-8
        py-3
        font-semibold
        hover:bg-red-700
        transition-all
        duration-200
      "
    >
      Logout
    </button>

  </div>

</div>

      </div>

    </div>

  );

}