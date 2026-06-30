'use client';

import {
  useState,
  useEffect,
  useRef
} from "react";
import AdminDashboard from "./components/admin/AdminDashboard";

export default function Home() {
  const [showLogin, setShowLogin] = useState(true);
  const [showSignup, setShowSignup] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loggedInUser, setLoggedInUser] = useState("");

  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<{ [key: string]: any[] }>({});
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
const [showAddAccount, setShowAddAccount] = useState(false);
const [selectedImage, setSelectedImage] = useState<File | null>(null);
const [selectedVoice, setSelectedVoice] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState("");
const [showReportForm, setShowReportForm] = useState(false);

const [reportReason, setReportReason] = useState("");

const [reportDescription, setReportDescription] = useState("");
const [isAdmin, setIsAdmin] = useState(false);
const [showAdminDashboard, setShowAdminDashboard] = useState(false);
const [adminTab, setAdminTab] = useState("");
const [reports, setReports] = useState<any[]>([]);
const [showEvidence, setShowEvidence] =
  useState(false);
  const [fullscreenImage, setFullscreenImage] =
  useState("");

const [selectedEvidence, setSelectedEvidence] =
  useState<any>(null);
  const [evidenceList, setEvidenceList] =
  useState<any[]>([]);

const [analysisHistory, setAnalysisHistory] =
  useState<any[]>([]);
  const [selectedReportMessage, setSelectedReportMessage] =
  useState<any>(null);

const [showContextModal, setShowContextModal] =
  useState(false);

const [selectedReport, setSelectedReport] =
  useState<any>(null);
  const [playingAudio, setPlayingAudio] =
  useState<number | null>(null);

const [typingText, setTypingText] =
  useState("");

const [isTyping, setIsTyping] =
  useState(false);
  const [reportMode, setReportMode] =
  useState(false);
  const [showAnalysisModal, setShowAnalysisModal] =
  useState(false);

const [analysisData, setAnalysisData] =
  useState<any>(null);
  const socketRef =
  useRef<WebSocket | null>(
    null
  );
  

  useEffect(() => {

  if (!loggedInUser) return;

  socketRef.current =
    new WebSocket(
      `ws://127.0.0.1:8000/ws/${loggedInUser}`
    );

  socketRef.current.onmessage =
    async (event) => {

      const data =
        JSON.parse(event.data);

      if (
        data.type === "message"
      ) {

        const friend =
          data.sender === loggedInUser
            ? data.receiver
            : data.sender;

        const response =
          await fetch(
            `http://127.0.0.1:8000/conversation/${loggedInUser}/${friend}`
          );

        const conversation =
          await response.json();

        setMessages((prev) => ({
          ...prev,
          [friend]:
            conversation.messages.map(
              (msg: any) => ({
                id: msg.id,
                sender: msg.sender,
                receiver: msg.receiver,

                text:
                  msg.message_type === "Text"
                    ? msg.message
                    : null,

                image:
                  msg.message_type === "Image"
                    ? `http://127.0.0.1:8000/${msg.message}`
                    : null,

                voice:
                  msg.message_type === "Voice"
                    ? `http://127.0.0.1:8000/${msg.message}`
                    : null,

                created_at:
                  msg.created_at,

                message_status:
                  msg.message_status
              })
            )
        }));

      }

      if (
        data.type === "typing"
      ) {

        setTypingText(
          `${data.sender} is typing...`
        );

      }

      if (
        data.type === "stop_typing"
      ) {

        setTypingText("");

      }

    };

  return () => {

    socketRef.current?.close();

  };

}, [loggedInUser]);

useEffect(() => {

  if (!loggedInUser) return;

  socketRef.current =
    new WebSocket(
      `ws://127.0.0.1:8000/ws/${loggedInUser}`
    );

  socketRef.current.onmessage =
    async (event) => {

      const data =
        JSON.parse(event.data);

      if (
        data.type === "message"
      ) {

        const friend =
          data.sender === loggedInUser
            ? data.receiver
            : data.sender;

        const response =
          await fetch(
            `http://127.0.0.1:8000/conversation/${loggedInUser}/${friend}`
          );

        const conversation =
          await response.json();

        setMessages((prev) => ({
          ...prev,
          [friend]:
            conversation.messages.map(
              (msg: any) => ({
                id: msg.id,
                sender: msg.sender,
                receiver: msg.receiver,

                text:
                  msg.message_type === "Text"
                    ? msg.message
                    : null,

                image:
                  msg.message_type === "Image"
                    ? `http://127.0.0.1:8000/${msg.message}`
                    : null,

                voice:
                  msg.message_type === "Voice"
                    ? `http://127.0.0.1:8000/${msg.message}`
                    : null,

                created_at:
                  msg.created_at,

                message_status:
                  msg.message_status
              })
            )
        }));

      }

      if (
        data.type === "typing"
      ) {

        setTypingText(
          `${data.sender} is typing...`
        );

      }

      if (
        data.type === "stop_typing"
      ) {

        setTypingText("");

      }

    };

  return () => {

    socketRef.current?.close();

  };

}, [loggedInUser]);


  useEffect(() => {

  if (!loggedInUser || !showAdminDashboard) return;

  const loadDashboardData = async () => {

    try {

      const [

        usersResponse,

        reportsResponse,

        evidenceResponse,

        analysisResponse,

        dashboardResponse

      ] = await Promise.all([

        fetch(
          `http://127.0.0.1:8000/users/${loggedInUser}`
        ),

        fetch(
          "http://127.0.0.1:8000/reports"
        ),

        fetch(
          "http://127.0.0.1:8000/evidence"
        ),

        fetch(
          "http://127.0.0.1:8000/analysis-history"
        ),

        fetch(
          "http://127.0.0.1:8000/dashboard-stats"
        )

      ]);

      const usersData =
        await usersResponse.json();

      const reportsData =
        await reportsResponse.json();

      const evidenceData =
        await evidenceResponse.json();

      const analysisData =
        await analysisResponse.json();

      const dashboardData =
        await dashboardResponse.json();

      setUsers(usersData.users || []);

      setReports(reportsData || []);

      console.log(
  "Evidence Count:",
  evidenceData.length
);

setEvidenceList([...evidenceData]);

      setAnalysisHistory(analysisData || []);

      window.dispatchEvent(
        new CustomEvent(
          "dashboard-refresh",
          {
            detail: dashboardData
          }
        )
      );

    }

    catch (err) {

      console.error(err);

    }

  };

  loadDashboardData();

  const interval = setInterval(
    loadDashboardData,
    1000
  );

  return () => clearInterval(interval);

}, [

  loggedInUser,

  showAdminDashboard

]);
useEffect(() => {

  if (!selectedUser) return;

  const interval = setInterval(
    async () => {

      const response = await fetch(
        `http://127.0.0.1:8000/typing/${selectedUser}/${loggedInUser}`
      );

      const data =
        await response.json();

      if (data.typing) {

        setTypingText(
          `${selectedUser} is typing...`
        );

      } else {

        setTypingText("");

      }

    },
    1000
  );

  return () =>
    clearInterval(interval);

}, [selectedUser, loggedInUser]);
useEffect(() => {

  if (!loggedInUser || !selectedUser) return;

  const interval = setInterval(
    async () => {

      const response = await fetch(
        `http://127.0.0.1:8000/conversation/${loggedInUser}/${selectedUser}`
      );

      const data = await response.json();

      setMessages((prev) => ({
        ...prev,
        [selectedUser]:
          data.messages.map((msg: any) => ({
            id: msg.id,
            sender: msg.sender,
            receiver: msg.receiver,

            text:
              msg.message_type === "Text"
                ? msg.message
                : null,

            image:
              msg.message_type === "Image"
                ? `http://127.0.0.1:8000/${msg.message}`
                : null,

            voice:
              msg.message_type === "Voice"
                ? `http://127.0.0.1:8000/${msg.message}`
                : null,

            created_at:
              msg.created_at,

            message_status:
              msg.message_status
          }))
      }));

    },
    1000
  );

  return () => clearInterval(interval);

}, [loggedInUser, selectedUser]);
useEffect(() => {

  if (!loggedInUser || isAdmin) return;

  const loadUsers = async () => {

    const response = await fetch(
      `http://127.0.0.1:8000/users/${loggedInUser}`
    );

    const data = await response.json();

    setUsers(data.users || []);

  };

  loadUsers();

  const interval = setInterval(
    loadUsers,
    1000
  );

  return () => clearInterval(interval);

}, [loggedInUser, isAdmin]);
if (showAdminDashboard) {
  return (
    <AdminDashboard
      adminTab={adminTab}
      setAdminTab={setAdminTab}
      messages={messages}
      users={users}
      reports={reports}
      setReports={setReports}
      evidenceList={evidenceList}
      analysisHistory={analysisHistory}
      onLogout={async () => {
        await fetch("http://127.0.0.1:8000/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: loggedInUser,
          }),
        });

        setLoggedInUser("");
        setShowDashboard(false);
        setShowAdminDashboard(false);
        setSelectedUser("");
        setMessages({});
        setSelectedImage(null);
        setSelectedVoice(null);
      }}
      onAddAccount={() => {
        setShowAddAccount(true);
      }}
      onViewEvidence={(evidence) => {
        setSelectedEvidence(evidence);
        setShowEvidence(true);
      }}
      onViewContext={(report) => {
        setSelectedReport(report);
        setShowContextModal(true);
      }}
      
    />
  );
}
return (

  <main className="min-h-screen bg-white flex items-center justify-center">
    {showDashboard ? (
  <div className="h-screen w-full flex absolute inset-0">
  <div
className="
w-[340px]
bg-white
border-r
border-gray-200
flex
flex-col
h-screen
shadow-sm
overflow-hidden
">
     <div className="p-6 border-b border-gray-100">

  <div className="flex items-center gap-4">

    <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-md">

      {loggedInUser.charAt(0).toUpperCase()}

    </div>

    <div className="flex-1">

      <div className="text-lg font-bold text-gray-900">

        {loggedInUser}

      </div>

      <div className="text-sm text-gray-500">

        CyberShield User

      </div>

    </div>

  </div>

</div>
<div className="flex flex-col flex-1 p-5 min-h-0">

<div className="mb-4">

<h2 className="text-sm font-bold uppercase tracking-[0.25em] text-gray-500 text-center mb-5">

CONVERSATIONS

</h2>

<div className="relative">

<input
type="text"
placeholder="Search users..."
value={searchTerm}
onChange={(e) => setSearchTerm(e.target.value)}
className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
/>

<svg
className="absolute right-4 top-3.5 h-5 w-5 text-gray-400"
fill="none"
stroke="currentColor"
strokeWidth="2"
viewBox="0 0 24 24"
>

<circle cx="11" cy="11" r="8"/>

<path d="M21 21l-4.3-4.3"/>

</svg>

</div>

</div>
<div className="flex-1 overflow-y-auto pr-2 space-y-3 min-h-0"> 
  {users
.filter((user: any) => {

if (
!user.username
.toLowerCase()
.includes(searchTerm.toLowerCase())
)
return false;

    if (user.username === loggedInUser) {
      return false;
    }

    if (!isAdmin && user.username.toLowerCase() === "admin") {
      return false;
    }

    return true;

  })
  .map((user: any) => (
<button

key={user.username}

onClick={async () => {

  setSelectedUser(user.username);

  const response = await fetch(
   `http://127.0.0.1:8000/conversation/${loggedInUser}/${user.username}`
  );

  const data = await response.json();

  for (const msg of data.messages) {

    if (
      msg.receiver === loggedInUser &&
      msg.message_status === "Sent"
    ) {

      await fetch(
        `http://127.0.0.1:8000/message/${msg.id}/delivered`,
        {
          method: "PUT"
        }
      );

    }

  }

  for (const msg of data.messages) {

    if (
      msg.receiver === loggedInUser &&
      msg.message_status === "Delivered"
    ) {

      await fetch(
        `http://127.0.0.1:8000/message/${msg.id}/read`,
        {
          method: "PUT"
        }
      );

    }

  }

  setMessages((prev) => ({
    ...prev,
    [user.username]: (data.messages || []).map(
      (msg: any) => ({
        id: msg.id,
        sender: msg.sender,
        receiver: msg.receiver,

        text:
          msg.message_type === "Text"
            ? msg.message
            : null,

        image:
          msg.message_type === "Image"
            ? `http://127.0.0.1:8000/${msg.message}`
            : null,

        voice:
          msg.message_type === "Voice"
            ? `http://127.0.0.1:8000/${msg.message}`
            : null,

        created_at: msg.created_at,

        message_status: msg.message_status

      })
    )
  }));

}}

className={`

w-full

mb-3

rounded-2xl

transition-all

duration-200

${
selectedUser === user.username
? "bg-blue-600 text-white shadow-lg"
: "bg-white hover:bg-blue-50 border border-gray-200"
}

`}

>

<div className="flex items-center gap-3 px-4 py-3">
<div
className={`

w-11

h-11

rounded-full

flex

items-center

justify-center

font-bold

${
selectedUser === user.username
? "bg-white text-blue-600"
: "bg-blue-100 text-blue-700"
}

`}
>

{user.username.charAt(0).toUpperCase()}

</div>

<div className="flex-1 text-left">

<div className="font-semibold">

{user.username}

</div>

<div
className={`

text-xs

mt-1

${
selectedUser === user.username
? "text-blue-100"
: "text-gray-400"
}

`}
>

Protected by CyberShield

</div>

</div>

<div
className={`

w-3

h-3

rounded-full

${
selectedUser === user.username
? "bg-white"
: "bg-green-500"
}

`}
/>

</div>

</button>

))
    }
    </div>

</div>

<div className="border-t border-gray-200 p-5 bg-white shrink-0">

{isAdmin && (

<button

onClick={async () => {

setShowAdminDashboard(
!showAdminDashboard
);

const response = await fetch(
"http://127.0.0.1:8000/reports"
);

const data = await response.json();

setReports(data);

const evidenceResponse = await fetch(
"http://127.0.0.1:8000/evidence"
);

const evidenceData =
await evidenceResponse.json();

setEvidenceList(evidenceData);

}}

className="w-full mb-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold transition"

>

 Admin Dashboard

</button>

)}

<button

onClick={() => setShowSettings(!showSettings)}

className="w-full flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 hover:bg-gray-50 transition"

>

<span className="font-medium">

⚙ Settings

</span>

<span>

{showSettings ? "▲" : "▼"}

</span>

</button>

{showSettings && (

<div className="mt-3 space-y-2">

<button

onClick={() => setShowAddAccount(!showAddAccount)}

className="w-full rounded-xl bg-gray-100 hover:bg-gray-200 py-3 transition"

>

➕ Add Account

</button>

{showAddAccount && (

<div className="space-y-2 pl-2">

<button

onClick={() => {

setShowDashboard(false);

setShowSignup(false);

}}

className="w-full rounded-lg border border-blue-200 py-2 hover:bg-blue-50"

>

Login

</button>

<button

onClick={() => {

setShowDashboard(false);

setShowSignup(true);

}}

className="w-full rounded-lg border border-blue-200 py-2 hover:bg-blue-50"

>

Create Account

</button>

</div>

)}

<button

onClick={async () => {

await fetch(
"http://127.0.0.1:8000/logout",
{
method: "POST",
headers: {
"Content-Type":"application/json"
},
body: JSON.stringify({
username: loggedInUser
})
}
);

setShowDashboard(false);

setLoggedInUser("");

setSelectedUser("");

setMessages({});

setSelectedImage(null);

setSelectedVoice(null);

}}

className="w-full rounded-xl border border-red-200 text-red-600 hover:bg-red-50 py-3 font-semibold transition"

>

Logout

</button>

</div>

)}

</div>
    </div>

    <div className="flex-1 flex flex-col">
    
{showEvidence && selectedEvidence && (

  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
<div
  className="
    bg-white
    w-[700px]
    max-h-[85vh]
    overflow-y-auto
    rounded-3xl
    border
    border-gray-100
    shadow-2xl
    p-8
    relative
  "
>
  <button
    onClick={() => {
      setShowEvidence(false);
      setSelectedEvidence(null);
    }}
    className="absolute top-3 right-4 text-gray-500 text-xl"
  >
    ✕
  </button>
  <div className="flex items-center gap-4 mb-8">

  <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl">
    🛡
  </div>

  <div>

    <h2 className="text-3xl font-bold text-gray-900">
      AI Evidence
    </h2>

    <p className="text-gray-500">
      Detailed moderation analysis
    </p>

  </div>

</div>
  <div className="grid grid-cols-2 gap-6">

  <div className="rounded-2xl bg-gray-50 p-5">
    <div className="text-xs uppercase text-gray-400">
      Status
    </div>

    <div className="mt-2 text-lg font-bold">
      {selectedEvidence.status}
    </div>
  </div>

  <div className="rounded-2xl bg-gray-50 p-5">
    <div className="text-xs uppercase text-gray-400">
      Evidence Type
    </div>

    <div className="mt-2 text-lg font-bold">
      {selectedEvidence.evidence_type}
    </div>
  </div>

  <div className="rounded-2xl bg-gray-50 p-5">
    <div className="text-xs uppercase text-gray-400">
      Sender
    </div>

    <div className="mt-2 font-semibold">
      {selectedEvidence.sender}
    </div>
  </div>

  <div className="rounded-2xl bg-gray-50 p-5">
    <div className="text-xs uppercase text-gray-400">
      Receiver
    </div>

    <div className="mt-2 font-semibold">
      {selectedEvidence.receiver}
    </div>
  </div>

</div>

<div className="mt-8 rounded-2xl bg-blue-50 border border-blue-100 p-6">

  <div className="text-xs uppercase text-blue-500 mb-2">

  Original Message

</div>

<div
  className="
    text-gray-800
    whitespace-pre-wrap
    break-words
  "
>

  {selectedEvidence.message
    ? selectedEvidence.message
    : selectedEvidence.evidence_type === "Image"
      ? "No OCR text detected."
      : selectedEvidence.evidence_type === "Voice"
        ? "No transcription detected."
        : "No message available."}

</div>

</div>

{selectedEvidence.evidence_type === "Text" && (

<div className="grid grid-cols-2 gap-6 mt-6">

<div className="rounded-2xl bg-gray-50 p-5">

<div className="text-xs uppercase text-gray-400">
Sentiment
</div>

<div className="mt-2 font-semibold">
{selectedEvidence.sentiment}
</div>

</div>

<div className="rounded-2xl bg-gray-50 p-5">

<div className="text-xs uppercase text-gray-400">
Emotion
</div>

<div className="mt-2 font-semibold">
{selectedEvidence.emotion}
</div>

</div>

</div>

)}

<div className="mt-6 rounded-2xl bg-red-50 border border-red-100 p-6">

<div className="text-xs uppercase text-red-500 mb-2">
AI Decision
</div>

<div className="font-bold text-red-600">
{selectedEvidence.ai_result}
</div>

</div>
</div>
  </div>
)}
{showContextModal && selectedReport && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

<div className="bg-white p-6 rounded-xl w-[600px] shadow-xl relative">

<button
onClick={() => {
setShowContextModal(false);
setSelectedReport(null);
}}
className="absolute top-3 right-4 text-xl"
>
✕
</button>

<h2 className="text-2xl font-bold mb-4">
Report Context
</h2>

<div className="space-y-3">

<div>
<strong>Reporter:</strong>
{" "}
{selectedReport.reporter_user}
</div>

<div>
<strong>Reported User:</strong>
{" "}
{selectedReport.reported_user}
</div>

<div>

<strong>Reported Message:</strong>

<div
  className="
    mt-2
    rounded-xl
    bg-gray-50
    border
    p-3
    whitespace-pre-wrap
    break-words
  "
>

{selectedReport.reported_message ||
"No message available."}

</div>

</div>

<div>
<strong>Reason:</strong>
{" "}
{selectedReport.reason}
</div>

<div>
<strong>Description:</strong>
{" "}
{selectedReport.description}
</div>

<div>
<strong>Context Before:</strong>

<div
className="
mt-2
rounded-xl
bg-gray-50
border
p-3
whitespace-pre-wrap
"
>

{selectedReport.context_before ||
"No previous context."}

</div>
</div>

<div>
<strong>Context After:</strong>

<div
className="
mt-2
rounded-xl
bg-gray-50
border
p-3
whitespace-pre-wrap
"
>

{selectedReport.context_after ||
"No later context."}

</div>
</div>

</div>

</div>

</div>

)}

{showAnalysisModal && analysisData && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">

  <div className="bg-white rounded-2xl shadow-2xl w-[520px] max-w-[95vw] overflow-hidden">

    <div className="bg-red-500 text-white px-6 py-4 flex items-center justify-between">

      <h2 className="text-xl font-bold">
        🚫 Message Blocked
      </h2>

      <button
        onClick={() => {
          setShowAnalysisModal(false);
          setAnalysisData(null);
        }}
        className="text-2xl font-bold hover:scale-110 transition"
      >
        ✕
      </button>

    </div>

    <div className="p-6 space-y-4">

      <div>
        <span className="font-semibold">Decision:</span>{" "}
        {analysisData.bullying}
      </div>

      <div>
        <span className="font-semibold">Confidence:</span>{" "}
        {analysisData.confidence}%
      </div>

      <div>
        <span className="font-semibold">Severity:</span>{" "}
        {analysisData.severity}
      </div>

      <div>
        <span className="font-semibold">Risk Level:</span>{" "}
        {analysisData.risk_level}
      </div>

      <div>
        <span className="font-semibold">Emotion:</span>{" "}
        {analysisData.emotion}
      </div>

      <div>
        <span className="font-semibold">Relationship:</span>{" "}
        {analysisData.relationship}
      </div>

      <div>
        <span className="font-semibold">Sarcasm:</span>{" "}
        {analysisData.sarcasm_detected ? "Yes" : "No"}
      </div>

      <div>
        <span className="font-semibold">Summary:</span>

        <div className="mt-2 rounded-lg bg-gray-50 border p-3 text-sm">
          {analysisData.gemini_summary || "No summary available."}
        </div>

      </div>

      <div>
        <span className="font-semibold">Reason:</span>

        <div className="mt-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm">
          {analysisData.explanation}
        </div>

      </div>

    </div>

    <div className="px-6 py-4 bg-gray-50 flex justify-end">

      <button
        onClick={() => {
          setShowAnalysisModal(false);
          setAnalysisData(null);
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition"
      >
        Close
      </button>

    </div>

  </div>

</div>

)}

{fullscreenImage && (

  <div
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]"
    onClick={() => setFullscreenImage("")}
  >

    <button
      onClick={() => setFullscreenImage("")}
      className="absolute top-5 right-6 text-white text-4xl"
    >
      ✕
    </button>

    <img
      src={fullscreenImage}
      alt="Full Screen"
      className="
        max-w-[90vw]
        max-h-[90vh]
        rounded-2xl
        shadow-2xl
      "
      onClick={(e) => e.stopPropagation()}
    />

  </div>

)}
  {/* Chat Header */}
<div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between shadow-sm">

  <div className="flex items-center gap-4">

    <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-md">

      {selectedUser
        ? selectedUser.charAt(0).toUpperCase()
        : "?"}

    </div>

    <div>

      <h2 className="text-xl font-bold text-gray-900">

        {selectedUser || "Select a Conversation"}

      </h2>

      {selectedUser && (

        <div className="flex flex-col mt-1">

          {typingText ? (

            <span className="text-sm text-blue-600 font-medium">

              {typingText}

            </span>

          ) : (

            <span className="text-sm text-gray-500">

              Protected by CyberShield

            </span>

          )}

          <span className="inline-flex w-fit mt-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">

            CyberShield Active

          </span>

        </div>

      )}

    </div>

  </div>

  {selectedUser && (

    <button
  onClick={() => setReportMode(!reportMode)}
  className={`
    inline-flex
    items-center
    justify-center
    px-4
    py-1.5
    rounded-full
    text-sm
    font-semibold
    shadow-sm
    transition-all
    duration-200
    hover:scale-105
    ${
      reportMode
        ? "bg-red-100 text-red-700 hover:bg-red-200"
        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
    }
  `}
>
  {reportMode
    ? "Cancel Report"
    : "Select Message to Report"}
</button>
  )}

</div>

  {/* Messages Area */}
  {showReportForm && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white p-6 rounded-xl w-96 shadow-xl">

      <h2 className="text-xl font-bold mb-4">
         Report User
      </h2>

      <select
  value={reportReason}
  onChange={(e) => setReportReason(e.target.value)}
  className="w-full border p-2 rounded mb-3"
>

  <option value="">
    Select Reason
  </option>

  <option value="Harassment">
    Harassment
  </option>

  <option value="Bullying">
    Bullying
  </option>

  <option value="Threats">
    Threats
  </option>

  <option value="Hate Speech">
    Hate Speech
  </option>

  <option value="Spam">
    Spam
  </option>

  <option value="Inappropriate Content">
    Inappropriate Content
  </option>

  <option value="Other">
    Other
  </option>

</select>

      <textarea
        placeholder="Additional Description"
        value={reportDescription}
        onChange={(e) => setReportDescription(e.target.value)}
        className="w-full border p-2 rounded mb-4"
      />

      <div className="flex justify-end gap-2">

        <button
          onClick={() => setShowReportForm(false)}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>

       <button
  onClick={async () => {

    const response = await fetch(
      "http://127.0.0.1:8000/report",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({

  message_id: selectedReportMessage?.id,

  reporter_user: loggedInUser,

  reported_user: selectedUser,

  reported_message: "",
  reason: reportReason,

  description: reportDescription,

  context_before: "",

  context_after: ""

}),
      }
    );

    const data = await response.json();

    alert(data.message);

    setShowReportForm(false);
    setReportReason("");
    setReportDescription("");

  }}
  className="bg-red-500 text-white px-4 py-2 rounded"
>
  Submit Report
</button>

      </div>

    </div>

  </div>
)}

<div
  className="
    flex-1
    overflow-y-auto
    bg-[#f8fafc]
    px-8
    py-6
    space-y-5
    scroll-smooth
  "
>

{!selectedUser && (

<div className="h-full flex flex-col items-center justify-center text-center">

<div className="w-28 h-28 rounded-full bg-blue-100 flex items-center justify-center shadow-md mb-6">

<span className="text-5xl">💬</span>

</div>

<h2 className="text-3xl font-bold text-gray-700">

Select a Conversation

</h2>

<p className="mt-3 text-gray-500 max-w-md leading-relaxed">

Choose a user from the left sidebar to start chatting securely with CyberShield AI.

</p>

</div>

)}

   {selectedUser &&
  messages[selectedUser]?.map((msg: any, index: number) => (
  <div
  key={index}
  onClick={() => {

    if (!reportMode) return;

    setSelectedReportMessage(msg);

    setShowReportForm(true);

    setReportMode(false);

  }}
  className={`
flex
flex-col
mb-5
transition-all
duration-500
ease-out
animate-[fadeIn_.35s_ease]
hover:scale-[1.01]
${
reportMode
? "cursor-pointer rounded-2xl border-2 border-red-300 p-3 hover:bg-red-50"
: ""
}
${
msg.sender === loggedInUser
? "items-end"
: "items-start"
}
`}
>
{msg.text && (

  <div
    className={`max-w-[70%] ${
      msg.sender === loggedInUser
        ? "self-end"
        : "self-start"
    }`}
  >

    <div
      className={`
        px-5
        py-3
        rounded-2xl
        shadow-sm
        break-words
        transition-all
        duration-200

        ${
  msg.sender === loggedInUser
    ? "bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-500 text-white rounded-3xl rounded-br-lg shadow-lg border border-blue-500"
    : "bg-gradient-to-br from-blue-50 to-white text-gray-800 rounded-3xl rounded-bl-lg shadow-md border border-blue-100"
}
      `}
    >

      <p className="leading-relaxed text-[15px]">

        {msg.text}

      </p>

    </div>

  </div>

)}
    

      {msg.image && (

  <div
    className={`max-w-[320px] ${
      msg.sender === loggedInUser
        ? "self-end"
        : "self-start"
    }`}
  >

    <div
      className={`
        p-2
        rounded-2xl
        shadow-md
        overflow-hidden
        transition-all
        duration-200

        ${
          msg.sender === loggedInUser
            ? "bg-white border border-blue-200"
            : "bg-white border border-gray-200"
        }
      `}
    >

      <img
  src={msg.image}
  alt="uploaded"
  onClick={() => setFullscreenImage(msg.image)}
  className="
    w-full
    rounded-xl
    object-cover
    max-h-80
    cursor-pointer
    hover:scale-[1.02]
    transition-all
    duration-200
  "
/>

    </div>

  </div>

)}

     {msg.voice && (
  <div
    className={`
      mt-2
      max-w-xs
      rounded-2xl
      px-4
      py-3
      flex
      items-center
      gap-3
      shadow-sm
      ${
        msg.sender === loggedInUser
          ? "bg-blue-600 text-white"
          : "bg-blue-50 border border-blue-100"
      }
    `}
  >

    {/* Play Button */}

    <button
  onClick={() => {

    const audio =
      document.getElementById(
        `audio-${msg.id}`
      ) as HTMLAudioElement;

    if (!audio) return;

    if (playingAudio === msg.id) {

      audio.pause();

      setPlayingAudio(null);

    } else {

      audio.play();

      setPlayingAudio(msg.id);

      audio.onended = () => {

        setPlayingAudio(null);

      };

    }

  }}

  className={`
    w-10
    h-10
    rounded-full
    flex
    items-center
    justify-center
    transition
    ${
      msg.sender === loggedInUser
        ? "bg-white text-blue-600"
        : "bg-blue-600 text-white"
    }
  `}
>

  {playingAudio === msg.id ? "❚❚" : "▶"}

</button>

    {/* Fake Waveform */}

    <div className="flex items-center gap-[3px] flex-1 h-8">

      {Array.from({ length: 28 }).map((_, i) => (

        <div
  key={i}
  className={`
    rounded-full
    transition-all
    duration-300
    ${
      msg.sender === loggedInUser
        ? "bg-white"
        : "bg-blue-500"
    }
    ${
      playingAudio === msg.id
        ? "animate-pulse"
        : ""
    }
  `}
  style={{
    width: "3px",
    height: `${
      playingAudio === msg.id
        ? 12 + ((i * 7) % 18)
        : 10 + (i % 6) * 4
    }px`,
    opacity: playingAudio === msg.id ? 1 : 0.85,
    transitionDelay: `${i * 25}ms`
  }}
/>

      ))}

    </div>

    {/* Hidden Audio */}

    <audio
      id={`audio-${msg.id}`}
      className="hidden"
    >
      <source src={msg.voice} />
    </audio>

  </div>
)}
    </div>
  ))
}

 </div>
{selectedImage && (
  <div className="mx-5 mt-3 mb-5 flex justify-start">
    <div
  className="
    inline-flex
    flex-col
    self-start
    rounded-2xl
    border
    border-blue-100
    bg-white
    shadow-lg
    overflow-hidden
  "
>
      <div className="p-4 flex items-center justify-center">
  <img
    src={imagePreview}
    alt="preview"
    className="
      block
      max-w-[220px]
      max-h-[180px]
      w-auto
      h-auto
      rounded-xl
    "
  />
</div>

      <div
        className="
          flex
          items-center
          justify-between
          gap-6
          px-4
          py-4
          border-t
          border-blue-100
          bg-blue-50
        "
      >
        <div className="pr-4">
          <div className="font-semibold text-gray-800">
            📷 Image Ready
          </div>

          <div className="text-xs text-gray-500 mt-1">
            Ready to send
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedImage(null);
            setImagePreview("");
          }}
          className="
            shrink-0
            px-4
            py-2
            rounded-full
            bg-red-500
            text-white
            font-medium
            hover:bg-red-600
            transition
          "
        >
          Remove
        </button>
      </div>
    </div>
  </div>
)}
{selectedVoice && (

<div
className="
mx-5
mb-3
rounded-2xl
border
border-blue-100
bg-white
shadow-lg
"
>

<div
className="
flex
items-center
justify-between
px-5
py-4
"
>

<div className="flex items-center gap-4">

<svg
xmlns="http://www.w3.org/2000/svg"
className="w-8 h-8 text-blue-600"
fill="none"
viewBox="0 0 24 24"
stroke="currentColor"
strokeWidth={2}
>

<path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 1 0 6 0V6a3 3 0 0 0-3-3z"/>

<path d="M19 10v2a7 7 0 0 1-14 0v-2"/>

<line x1="12" y1="19" x2="12" y2="22"/>

<line x1="8" y1="22" x2="16" y2="22"/>

</svg>

<div>

<div className="font-semibold text-gray-800">

Voice Message Ready

</div>

<div className="text-xs text-gray-500">

{selectedVoice.name}

</div>

</div>

</div>

<button
onClick={()=>{
setSelectedVoice(null);
}}
className="
px-4
py-2
rounded-full
bg-red-500
text-white
font-medium
hover:bg-red-600
transition
"
>

Remove

</button>

</div>

</div>

)}

      <div
  className="
    border-t
    border-gray-200
    bg-white
    px-5
    py-4
    flex
    items-end
    gap-3
    shadow-[0_-4px_20px_rgba(0,0,0,0.04)]
  "
>
      <div className="relative">

  <button
    onClick={() => setShowUploadMenu(!showUploadMenu)}
    className="
w-11
h-11
rounded-full
bg-blue-50
hover:bg-blue-100
text-blue-600
text-2xl
flex
items-center
justify-center
transition
"
  >
    +
  </button>

  {showUploadMenu && (

<div
className="
absolute
bottom-14
left-0
w-56
bg-white
rounded-2xl
border
border-gray-100
shadow-2xl
overflow-hidden
z-50
"
>

<label
className="
flex
items-center
gap-4
px-5
py-4
cursor-pointer
hover:bg-blue-50
transition
"
>

<svg
xmlns="http://www.w3.org/2000/svg"
className="w-7 h-7 text-blue-600"
fill="none"
viewBox="0 0 24 24"
stroke="currentColor"
strokeWidth={2}
>

<rect
x="3"
y="5"
width="18"
height="14"
rx="2"
/>

<circle
cx="9"
cy="10"
r="2"
/>

<path d="M21 16l-5-5-6 6-2-2-5 5"/>

</svg>

<div>

<div className="font-semibold">
Upload Image
</div>


</div>

<input
type="file"
accept="image/*"
className="hidden"
onChange={(e)=>{

const file=e.target.files?.[0];

if(file){

setSelectedImage(file);

setImagePreview(
URL.createObjectURL(file)
);

setShowUploadMenu(false);

}

}}
/>

</label>

<label
className="
flex
items-center
gap-4
px-5
py-4
cursor-pointer
hover:bg-blue-50
transition
border-t
"
>

<svg
xmlns="http://www.w3.org/2000/svg"
className="w-7 h-7 text-blue-600"
fill="none"
viewBox="0 0 24 24"
stroke="currentColor"
strokeWidth={2}
>

<path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 1 0 6 0V6a3 3 0 0 0-3-3z"/>

<path d="M19 10v2a7 7 0 0 1-14 0v-2"/>

<line
x1="12"
y1="19"
x2="12"
y2="22"
/>

<line
x1="8"
y1="22"
x2="16"
y2="22"
/>

</svg>

<div>

<div className="font-semibold">
Upload Voice
</div>

</div>

<input
type="file"
accept="audio/*"
className="hidden"
onChange={(e)=>{

const file=e.target.files?.[0];

if(file){

setSelectedVoice(file);

setShowUploadMenu(false);

}

}}
/>

</label>

</div>

)}

</div>

       <input
  value={chatMessage}
  onChange={async (e) => {

    setChatMessage(
      e.target.value
    );

    if (
      !isTyping &&
      selectedUser
    ) {

      setIsTyping(true);

      await fetch(
        "http://127.0.0.1:8000/typing",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            sender:
              loggedInUser,
            receiver:
              selectedUser
          })
        }
      );
      socketRef.current?.send(
  JSON.stringify({
    type: "typing",
    sender: loggedInUser,
    receiver: selectedUser
  })
);

    }

  }}
  className="
flex-1
rounded-2xl
border
border-gray-200
bg-gray-50
px-5
py-3.5
text-[15px]
outline-none
transition-all
focus:border-blue-500
focus:bg-white
focus:ring-4
focus:ring-blue-100
"
  placeholder="Type a message..."
/>

        <button className="
inline-flex
items-center
rounded-full
bg-blue-100
text-blue-700
font-semibold
px-5
py-2
shadow-sm
hover:bg-blue-200
transition-all
duration-300
"
  onClick={async () => {

    // -----------------------------
    // TEXT MODERATION
    // -----------------------------

    if (
      !selectedImage &&
      !selectedVoice &&
      chatMessage.trim() !== ""
    ) {

      const response = await fetch(
        "http://127.0.0.1:8000/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            text: chatMessage,
            sender: loggedInUser,
            receiver: selectedUser
          })
        }
      );

      const analysis =
        await response.json();

      const bullying =
        analysis.bullying ===
          "⚠️ Bullying detected"
        ||
        analysis.prediction ===
          "⚠️ Bullying detected";

      if (bullying) {

  // -----------------------------
  // Save AI Evidence
  // -----------------------------

  await fetch(
    "http://127.0.0.1:8000/evidence",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json"
      },
      body: JSON.stringify({

        sender: loggedInUser,

        receiver: selectedUser,

        message: chatMessage,

        sentiment:
          analysis.sentiment,

        emotion:
          analysis.emotion,

        ai_result:
          analysis.bullying ||
          analysis.prediction,

        evidence_type:
          "Text"

      })
    }
  );

  // -----------------------------
  // Store blocked message
  // (Hidden from receiver)
  // -----------------------------

  await fetch(
    "http://127.0.0.1:8000/send-message",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json"
      },
      body: JSON.stringify({

        sender:
          loggedInUser,

        receiver:
          selectedUser,

        message:
          chatMessage,

        blocked:
          true,

        intent:
          analysis.intent,

        sentiment:
          analysis.sentiment,

        emotion:
          analysis.emotion,

        sarcasm:
          analysis.sarcasm_detected

      })
    }
  );

  setAnalysisData({
  bullying: analysis.bullying,
  confidence: analysis.confidence,
  severity: analysis.severity,
  risk_level: analysis.risk_level,
  emotion: analysis.emotion,
  relationship: analysis.relationship,
  relationship_score: analysis.relationship_score,
  sarcasm_detected: analysis.sarcasm_detected,
  gemini_summary: analysis.gemini_summary,
  explanation: analysis.explanation
});

setShowAnalysisModal(true);

return;
}

      await fetch(
        "http://127.0.0.1:8000/send-message",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({

            sender:
              loggedInUser,

            receiver:
              selectedUser,

            message:
              chatMessage,

            blocked: false,

            intent:
              analysis.intent,

            sentiment:
              analysis.sentiment,

            emotion:
              analysis.emotion,

            sarcasm:
              analysis.sarcasm_detected

          })
        }
      );

    }

    // PATCH 2 STARTS HERE
        // -----------------------------
    // IMAGE MODERATION
    // -----------------------------

    if (selectedImage) {

      const formData = new FormData();

      formData.append(
        "sender",
        loggedInUser
      );

      formData.append(
        "receiver",
        selectedUser
      );

      formData.append(
        "file",
        selectedImage
      );

      const imageResponse =
        await fetch(
          "http://127.0.0.1:8000/image",
          {
            method: "POST",
            body: formData
          }
        );

      const imageData =
        await imageResponse.json();

      const blocked =
        imageData.analysis?.analysis?.bullying ===
        "⚠️ Bullying detected";

      if (blocked) {

        await fetch(
          "http://127.0.0.1:8000/image-evidence",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({

              sender:
                loggedInUser,

              receiver:
                selectedUser,

              message:
    imageData.analysis?.extracted_text ||
    "No text detected",

              sentiment:
                imageData.analysis
                  ?.analysis
                  ?.sentiment || "",

              emotion:
                imageData.analysis
                  ?.analysis
                  ?.emotion || "",

              ai_result:
                imageData.analysis
                  ?.analysis
                  ?.bullying || "",

              evidence_type:
                "Image"

            })
          }
        );

                await fetch(
          "http://127.0.0.1:8000/send-image",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({

              sender: loggedInUser,

              receiver: selectedUser,

              image_path: imageData.file_path,

              ocr_text:
                imageData.analysis?.extracted_text || "",

              blocked: true

            })
          }
        );

       setAnalysisData({
  title: "🚫 Image Blocked",

  subtitle: "CyberShield AI has blocked this image.",

  detected_text:
    imageData.analysis?.extracted_text ||
    "No text detected",

  bullying:
    imageData.analysis?.analysis?.bullying,

  confidence:
    imageData.analysis?.analysis?.confidence,

  severity:
    imageData.analysis?.analysis?.severity,

  risk_level:
    imageData.analysis?.analysis?.risk_level,

  emotion:
    imageData.analysis?.analysis?.emotion,

  relationship:
    imageData.analysis?.analysis?.relationship,

  relationship_score:
    imageData.analysis?.analysis?.relationship_score,

  sarcasm_detected:
    imageData.analysis?.analysis?.sarcasm_detected,

  gemini_summary:
    imageData.analysis?.analysis?.gemini_summary ||
    "No summary available.",

  explanation:
    imageData.analysis?.analysis?.explanation
});

setShowAnalysisModal(true);

return;

      }

      await fetch(
        "http://127.0.0.1:8000/send-image",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({

            sender:
              loggedInUser,

            receiver:
              selectedUser,

            image_path:
              imageData.file_path,

            ocr_text: imageData.analysis?.extracted_text || ""

          })
        }
      );

    }

    // PATCH 3 STARTS HERE
        // -----------------------------
    // VOICE MODERATION
    // -----------------------------

    if (selectedVoice) {

      const formData = new FormData();

      formData.append(
        "sender",
        loggedInUser
      );

      formData.append(
        "receiver",
        selectedUser
      );

      formData.append(
        "file",
        selectedVoice
      );

      const voiceResponse =
        await fetch(
          "http://127.0.0.1:8000/voice",
          {
            method: "POST",
            body: formData
          }
        );

      const voiceData =
        await voiceResponse.json();

      const blocked =
        voiceData.analysis?.analysis?.bullying ===
        "⚠️ Bullying detected";

      if (blocked) {

        await fetch(
          "http://127.0.0.1:8000/voice-evidence",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({

              sender:
                loggedInUser,

              receiver:
                selectedUser,

              message:
    voiceData.analysis?.transcription ||
    "No transcription available",

              sentiment:
                voiceData.analysis
                  ?.analysis
                  ?.sentiment || "",

              emotion:
                voiceData.analysis
                  ?.analysis
                  ?.emotion || "",

              ai_result:
                voiceData.analysis
                  ?.analysis
                  ?.bullying || "",

              evidence_type:
                "Voice"

            })
          }
        );

                await fetch(
          "http://127.0.0.1:8000/send-voice",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({

              sender: loggedInUser,

              receiver: selectedUser,

              voice_path: voiceData.file_path,

              transcription:
                voiceData.analysis?.transcription || "",

              blocked: true

            })
          }
        );

       setAnalysisData({
  title: "🚫 Voice Message Blocked",

  subtitle:
    "CyberShield AI has blocked this voice message.",

  detected_text:
    voiceData.analysis?.transcription ||
    "No speech detected",

  bullying:
    voiceData.analysis?.analysis?.bullying,

  confidence:
    voiceData.analysis?.analysis?.confidence,

  severity:
    voiceData.analysis?.analysis?.severity,

  risk_level:
    voiceData.analysis?.analysis?.risk_level,

  emotion:
    voiceData.analysis?.analysis?.emotion,

  relationship:
    voiceData.analysis?.analysis?.relationship,

  relationship_score:
    voiceData.analysis?.analysis?.relationship_score,

  sarcasm_detected:
    voiceData.analysis?.analysis?.sarcasm_detected,

  gemini_summary:
    voiceData.analysis?.analysis?.gemini_summary ||
    "No summary available.",

  explanation:
    voiceData.analysis?.analysis?.explanation
});

setShowAnalysisModal(true);

return;

      }

      await fetch(
        "http://127.0.0.1:8000/send-voice",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({

            sender:
              loggedInUser,

            receiver:
              selectedUser,

            voice_path:
              voiceData.file_path,
            
            transcription: voiceData.analysis?.transcription || ""

          })
        }
      );

    }

    // PATCH 4 STARTS HERE
        // -----------------------------
    // REFRESH CONVERSATION
    // -----------------------------

    const refreshConversation =
      await fetch(
        `http://127.0.0.1:8000/conversation/${loggedInUser}/${selectedUser}`
      );

    const conversationData =
      await refreshConversation.json();

    setMessages((prev) => ({
      ...prev,
      [selectedUser]:
        conversationData.messages.map(
          (msg: any) => ({
            id: msg.id,

            sender: msg.sender,

            receiver: msg.receiver,

            text:
              msg.message_type === "Text"
                ? msg.message
                : null,

            image:
              msg.message_type === "Image"
                ? `http://127.0.0.1:8000/${msg.message}`
                : null,

            voice:
              msg.message_type === "Voice"
                ? `http://127.0.0.1:8000/${msg.message}`
                : null,

            created_at:
              msg.created_at,

            message_status:
              msg.message_status
          })
        )
    }));


    // -----------------------------
    // STOP TYPING
    // -----------------------------

    await fetch(
      "http://127.0.0.1:8000/stop-typing",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
          sender:
            loggedInUser,
          receiver:
            selectedUser
        })
      }
    );

    setIsTyping(false);


    // -----------------------------
    // CLEAR INPUTS
    // -----------------------------

    setChatMessage("");

    setSelectedImage(null);

    setSelectedVoice(null);

    setImagePreview("");

    setShowUploadMenu(false);

  }}
>
  ➤ Send
</button>
      </div>
    </div>
    </div>
  
) : (
<div className="min-h-screen w-full bg-gradient-to-br from-white via-blue-50 to-blue-100 flex items-center justify-center px-6">

  <div className="w-full max-w-md">

    {/* Logo */}

    <div className="text-center mb-10">

      <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center mx-auto shadow-lg">

  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="w-11 h-11"
  >

    <path
      d="M12 2L5 5v6c0 5 3.4 9.5 7 11 3.6-1.5 7-6 7-11V5L12 2Z"
      fill="none"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M8 9.5C8 8.95 8.45 8.5 9 8.5H15C15.55 8.5 16 8.95 16 9.5V12.2C16 12.75 15.55 13.2 15 13.2H12.6L10.4 15V13.2H9C8.45 13.2 8 12.75 8 12.2V9.5Z"
      fill="white"
    />

    <circle cx="10.2" cy="10.9" r="0.45" fill="#2563EB" />
    <circle cx="12" cy="10.9" r="0.45" fill="#2563EB" />
    <circle cx="13.8" cy="10.9" r="0.45" fill="#2563EB" />

  </svg>

</div>
      <h1 className="text-4xl font-extrabold text-gray-800 mt-6">

        CyberShield AI

      </h1>

      <p className="text-gray-500 mt-2">

        AI Powered Anti-Cyberbullying Messenger

      </p>

    </div>

    {/* Card */}

    <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 p-8">

      {!showSignup ? (

        <>

          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">

            Login to your account

          </h2>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 mb-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 mb-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
          />

          <button
            onClick={async () => {

              const response = await fetch(
                "http://127.0.0.1:8000/login",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    username,
                    password,
                  }),
                }
              );

              const data = await response.json();

              if (data.success) {

                setLoggedInUser(username);

                setIsAdmin(
                  data.is_admin || false
                );

                const msgResponse = await fetch(
                  `http://127.0.0.1:8000/messages/${username}`
                );

                const msgData =
                  await msgResponse.json();

                const grouped: any = {};

                msgData.messages.forEach(
                  (msg: any) => {

                    const friend =
                      msg.sender === username
                        ? msg.receiver
                        : msg.sender;

                    if (!grouped[friend]) {
                      grouped[friend] = [];
                    }

                    grouped[friend].push({
                      id: msg.id,
                      sender: msg.sender,
                      receiver: msg.receiver,
                      text:
                        msg.message_type === "Text"
                          ? msg.message
                          : null,
                      image:
                        msg.message_type === "Image"
                          ? `http://127.0.0.1:8000/${msg.message}`
                          : null,
                      voice:
                        msg.message_type === "Voice"
                          ? `http://127.0.0.1:8000/${msg.message}`
                          : null,
                      created_at: msg.created_at,
                      message_status: msg.message_status
                    });

                  }
                );

                

setMessages(grouped);

const usersResponse = await fetch(
  `http://127.0.0.1:8000/users/${username}`
);

const usersData = await usersResponse.json();

setUsers(usersData.users || []);

if (data.is_admin) {

  const reportsResponse = await fetch(
    "http://127.0.0.1:8000/reports"
  );

  const reportsData = await reportsResponse.json();

  setReports(reportsData);

  const evidenceResponse = await fetch(
    "http://127.0.0.1:8000/evidence"
  );

  const evidenceData = await evidenceResponse.json();

  setEvidenceList(evidenceData);

  setShowAdminDashboard(true);

} else {

  setShowDashboard(true);

}
              } else {

                alert(data.message);

              }

            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition duration-200 shadow-lg"
          >

            Login

          </button>

          <div className="mt-8 text-center">

            <p className="text-gray-500">

              Don't have an account?

            </p>

            <button
              onClick={() => setShowSignup(true)}
              className="mt-3 w-full border border-blue-600 text-blue-600 hover:bg-blue-50 py-3 rounded-xl font-semibold transition"
            >

              Create Account

            </button>

          </div>

        </>

      ) : (

        <>

          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">

            Create Account

          </h2>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 mb-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 mb-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 mb-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />

          <button
            onClick={async () => {

              if (password !== confirmPassword) {
                alert("Passwords do not match");
                return;
              }

              const response = await fetch(
                "http://127.0.0.1:8000/signup",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    username,
                    password,
                  }),
                }
              );

              const data = await response.json();

              alert(data.message);

              if (data.success) {
                setShowSignup(false);
              }

            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold transition shadow-lg"
          >

            Create Account

          </button>

          <button
            onClick={() => setShowSignup(false)}
            className="mt-5 w-full text-blue-600 hover:text-blue-700 font-semibold"
          >

            Back to Login

          </button>

        </>

      )}

    </div>

  </div>

</div>
)}
  </main>
);
}