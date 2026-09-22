"use client";
import { useEffect, useState } from "react";

export default function AdminPage() {
 const [reports, setReports] = useState<any[]>([]);

useEffect(() => {
  fetch("http://127.0.0.1:8000/reports")
    .then((res) => res.json())
    .then((data) => {
      setReports(data);
    })
    .catch((err) => {
      alert("ERROR: " + err);
      console.error(err);
    });
}, []);

return (
 <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white p-10">
    <h1 className="text-4xl font-bold mb-8">
      🛡️cybershield-ai Dashboard
    </h1>

    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
      <h2 className="text-2xl font-semibold">
  Total Reports: {reports.length}
</h2>

      <a
  href="http://127.0.0.1:8000/export"
  className="inline-block mt-4 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-bold"
>
  📊 Export to Excel
</a>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full border border-white/20 rounded-xl overflow-hidden">
        <thead className="bg-pink-400 text-black">
          <tr>
            <th className="p-4 text-left">ID</th>
            <th className="p-4 text-left">Name</th>
            <th className="p-4 text-left">Type</th>
            <th className="p-4 text-left">Email</th>
            <th className="p-4 text-left">Description</th>
            <th className="p-4 text-left">Date</th>
          </tr>
        </thead>

        <tbody>
          {reports.map((report) => (
            <tr
              key={report.id}
              className="border-b border-white/10 hover:bg-white/10"
            >
              <td className="p-4">{report.id}</td>
              <td className="p-4">{report.name}</td>

<td className="p-4">
  {report.name === "Instagram Comment" ? "Comment" : "DM"}
</td>

<td className="p-4">{report.email}</td>
              <td className="p-4">{report.description}</td>
             <td>
  {new Date(report.created_at).toLocaleString()}
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
}