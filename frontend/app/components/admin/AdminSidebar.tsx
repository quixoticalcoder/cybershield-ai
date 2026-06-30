"use client";

import React from "react";

interface AdminSidebarProps {
  adminTab: string;
  setAdminTab: React.Dispatch<React.SetStateAction<string>>;
  onLogout: () => void;
  onAddAccount: () => void;
}

const menuItems = [
  {
    id: "",
    label: "Dashboard",
  },
  {
    id: "evidence",
    label: "AI Evidence",
  },
  {
    id: "reports",
    label: "User Reports",
  },
  {
    id: "users",
    label: "Users",
  },
  {
  id: "analysis",
  label: "Messages Analysed",
  },
];

export default function AdminSidebar({
  adminTab,
  setAdminTab,
  onLogout,
  onAddAccount,
}: AdminSidebarProps) {
  return (
    <aside
      className="
        w-[250px]
        min-h-full
        bg-white
        border-r
        border-gray-200
        flex
        flex-col
        justify-between
        px-6
        py-8
      "
    >
      {/* Top */}

      <div>

        <div className="mb-10">

          <h2 className="text-2xl font-bold text-gray-900">
            CyberShield AI
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Administration Panel
          </p>

        </div>

        <nav className="space-y-2">

          {menuItems.map((item) => {

            const active = adminTab === item.id;

            return (

              <button
                key={item.id}
                onClick={() => setAdminTab(item.id)}
                className={`
                  w-full
                  text-left
                  rounded-2xl
                  px-5
                  py-3
                  font-medium
                  transition-all
                  duration-200

                  ${
                    active
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                {item.label}
              </button>

            );

          })}

        </nav>

      </div>

      {/* Bottom */}

      <div className="border-t border-gray-200 pt-6">

        <button
          onClick={onAddAccount}
          className="
            w-full
            rounded-2xl
            border
            border-blue-200
            bg-white
            py-3
            font-semibold
            text-blue-700
            hover:bg-blue-50
            transition-all
            duration-200
          "
        >
          Add Account
        </button>
                <button
          onClick={onLogout}
          className="
            mt-4
            w-full
            rounded-2xl
            bg-red-50
            border
            border-red-200
            py-3
            font-semibold
            text-red-600
            hover:bg-red-100
            transition-all
            duration-200
          "
        >
          Logout
        </button>

      </div>

    </aside>
  );
}