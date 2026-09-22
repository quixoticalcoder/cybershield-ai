from fastapi import (
    FastAPI,
    UploadFile,
    File,
    Request,
    WebSocket,
    WebSocketDisconnect
)
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import os
import shutil

os.makedirs(
    "uploads/images",
    exist_ok=True
)

os.makedirs(
    "uploads/voices",
    exist_ok=True
)

from app.services.text_service import analyze_text
from app.services.image_service import analyze_image
from app.services.voice_service import analyze_voice
from app.services.conversation_memory import conversation_memory
from app.database import (
    conn,
    cursor
)
from pydantic import BaseModel
import pandas as pd
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
app = FastAPI(title="cybershield-ai")
app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class Report(BaseModel):

    message_id: int

    reporter_user: str

    reported_user: str

    reason: str

    description: str

    reported_message: str = ""

    context_before: str = ""

    context_after: str = ""

    sentiment: str = ""

    emotion: str = ""

    ai_result: str = ""

class User(BaseModel):
    username: str
    password: str

class Message(BaseModel):
    sender: str
    receiver: str
    message: str
    message_type: str = "Text"

    blocked: bool = False
    intent: str = "Neutral"
    sentiment: str = "Neutral"
    emotion: str = "Neutral"
    sarcasm: bool = False



typing_users = {}
active_connections = {}

# =========================
# USERS
# =========================

cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    is_blocked INTEGER DEFAULT 0,
    warning_count INTEGER DEFAULT 0,

    is_online INTEGER DEFAULT 0,
    last_seen TEXT DEFAULT ''
)
""")

# =========================
# MESSAGES
# =========================

cursor.execute("""
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT,
    receiver TEXT,

    message TEXT,

    message_type TEXT DEFAULT 'Text',

    status TEXT DEFAULT 'Delivered',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

# =========================
# AI EVIDENCE
# =========================

cursor.execute("""
CREATE TABLE IF NOT EXISTS evidence (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    sender TEXT,
    receiver TEXT,

    message TEXT,

    sentiment TEXT,
    emotion TEXT,
    ai_result TEXT,

    evidence_type TEXT,
    
    blocked INTEGER DEFAULT 1,
                         
    strikes INTEGER DEFAULT 1,

    status TEXT DEFAULT 'Detected',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

# =========================
# USER REPORTS
# =========================

cursor.execute("""
CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    message_id INTEGER,

    reporter_user TEXT,

    reported_user TEXT,

    reported_message TEXT,

    reason TEXT,

    description TEXT,

    context_before TEXT,

    context_after TEXT,

    status TEXT DEFAULT 'Pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

# =========================
# ANALYSIS HISTORY
# =========================

cursor.execute("""
CREATE TABLE IF NOT EXISTS analysis_history (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    sender TEXT,

    receiver TEXT,

    message TEXT,

    analysis_result TEXT,

    evidence_type TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

)
""")
conn.commit()
try:
    cursor.execute(
        "ALTER TABLE users ADD COLUMN is_online INTEGER DEFAULT 0"
    )
except:
    pass

try:
    cursor.execute(
        "ALTER TABLE users ADD COLUMN last_seen TEXT DEFAULT ''"
    )
except:
    pass

try:
    cursor.execute(
        "ALTER TABLE messages ADD COLUMN message_status TEXT DEFAULT 'Sent'"
    )
except:
    pass

conn.commit()

try:
    cursor.execute(
        """
        ALTER TABLE evidence
        ADD COLUMN blocked INTEGER DEFAULT 1
        """
    )
except:
    pass

conn.commit()
try:
    cursor.execute(
        """
        ALTER TABLE reports
        ADD COLUMN message_id INTEGER
        """
    )
except:
    pass

conn.commit()

@app.websocket("/ws/{username}")
async def websocket_endpoint(
    websocket: WebSocket,
    username: str
):

    await websocket.accept()

    active_connections[username] = websocket

    print(
        f"{username} connected"
    )

    try:

        while True:

            data = await websocket.receive_json()

            receiver = data.get(
                "receiver"
            )

            if (
                receiver
                in active_connections
            ):

                await active_connections[
    receiver
].send_json(
    {
        "type": data.get(
            "type",
            "message"
        ),
        "sender": username,
        "receiver": receiver
    }
)
    except WebSocketDisconnect:

        print(
            f"{username} disconnected"
        )

        active_connections.pop(
            username,
            None
        )
@app.post("/signup")
async def signup(user: User):
    try:
        cursor.execute(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            (user.username, user.password)
        )
        conn.commit()

        return {
            "success": True,
            "message": "User created successfully"
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }
@app.post("/login")
async def login(user: User):

    cursor.execute(
        """
        SELECT username,
               password,
               is_blocked
        FROM users
        WHERE username=? AND password=?
        """,
        (user.username, user.password)
    )

    existing_user = cursor.fetchone()

    if not existing_user:
        return {
            "success": False,
            "message": "Invalid username or password"
        }

    if existing_user[2] == 1:
        return {
            "success": False,
            "message": "Account blocked by admin"
        }

    is_admin = (
        user.username.lower() == "admin"
    )

    cursor.execute(
        """
        UPDATE users
        SET is_online = 1
        WHERE username = ?
        """,
        (user.username,)
    )

    conn.commit()

    return {
        "success": True,
        "message": "Login successful",
        "is_admin": is_admin
    }
@app.post("/logout")
async def logout(data: dict):

    cursor.execute(
        """
        UPDATE users
        SET
            is_online = 0,
            last_seen = ?
        WHERE username = ?
        """,
        (
            datetime.now().strftime(
                "%Y-%m-%d %H:%M:%S"
            ),
            data["username"]
        )
    )

    conn.commit()

    return {
        "success": True
    }

@app.post("/typing")
async def typing(data: dict):

    typing_users[
        f"{data['sender']}->{data['receiver']}"
    ] = True

    receiver = data["receiver"]

    if receiver in active_connections:

        await active_connections[
            receiver
        ].send_json({
            "type": "typing",
            "sender": data["sender"]
        })

    return {
        "success": True
    }
@app.post("/stop-typing")
async def stop_typing(data: dict):

    key = (
        f"{data['sender']}->{data['receiver']}"
    )

    typing_users[key] = False

    receiver = data["receiver"]

    if receiver in active_connections:

      await active_connections[
        receiver
    ].send_json({
        "type": "stop_typing",
        "sender": data["sender"]
    })

    return {"success": True}

@app.get(
"/typing/{sender}/{receiver}"
)
async def get_typing(
    sender: str,
    receiver: str
):

    key = f"{sender}->{receiver}"

    return {
        "typing":
        typing_users.get(key, False)
    }

@app.post("/send-message")
async def send_message(msg: Message):

    # ----------------------------
    # Check sender
    # ----------------------------

    cursor.execute(
        """
        SELECT is_blocked
        FROM users
        WHERE username = ?
        """,
        (msg.sender,)
    )

    sender = cursor.fetchone()

    if sender and sender[0] == 1:

        return {
            "success": False,
            "status": "blocked",
            "message": "Your account is blocked."
        }

    # ----------------------------
    # Check receiver
    # ----------------------------

    cursor.execute(
        """
        SELECT is_blocked
        FROM users
        WHERE username = ?
        """,
        (msg.receiver,)
    )

    receiver = cursor.fetchone()

    if receiver and receiver[0] == 1:

        return {
            "success": False,
            "status": "blocked",
            "message": "Receiver is blocked."
        }
    
    message_status = (

        "Blocked"
        if msg.blocked
        else "Sent"
    )
    delivery_status = (

       "Blocked"
       if msg.blocked
       else "Delivered"
    )

    cursor.execute(
        """
        INSERT INTO messages
        (
            sender,
            receiver,
            message,
            status,
            message_status
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            msg.sender,
            msg.receiver,
            msg.message,
            delivery_status,
            message_status
        )
    )

    conn.commit()

    if msg.blocked:
        return {
           
           "success" : True,
           "status" : "blocked",
           "message" : "Blocked message stored."


        }

    print("ACTIVE CONNECTIONS:", list(active_connections.keys()))
    print("RECEIVER:", msg.receiver)

    if msg.receiver in active_connections:

        await active_connections[msg.receiver].send_json({
            "type": "message",
            "sender": msg.sender,
            "receiver": msg.receiver
        })

    return {
        "success": True,
        "status": "safe",
        "message": "Message delivered"
    }
@app.get("/messages/{username}")
async def get_messages(username: str):

    cursor.execute(
        """
        SELECT
    id,
    sender,
    receiver,
    message,
    message_type,
    created_at,
    COALESCE(
        message_status,
        'Sent'
    )
        FROM messages

    WHERE

    (

        sender = ?

        OR receiver = ?

    )

    AND

    COALESCE(

        message_status,

        'Sent'

    ) != 'Blocked'

    ORDER BY id ASC

    """,

    (username, username)

)

    rows = cursor.fetchall()

    return {
        "messages": [
            {
                "id": row[0],
                "sender": row[1],
                "receiver": row[2],
                "message": (
                    row[3].split("FILE:")[1].split("\n")[0].strip()
                    if row[4] in ["Image", "Voice"] and "FILE:" in row[3]
                    else row[3]
                ),
                "message_type": row[4],
                "created_at": row[5],
                "message_status": row[6]
            }
            for row in rows
        ]
    }
@app.get(
"/conversation/{user1}/{user2}"
)
async def get_conversation(
    user1: str,
    user2: str
):

    cursor.execute(
        """
        SELECT
            id,
            sender,
            receiver,
            message,
            message_type,
            created_at,
            COALESCE(
                message_status,
                'Sent'
            )
        FROM messages

    WHERE

    (

        (

            sender = ?

            AND receiver = ?

        )

        OR

        (

            sender = ?

            AND receiver = ?

        )

    )

    AND

    COALESCE(

        message_status,

        'Sent'

    ) != 'Blocked'

    ORDER BY id ASC

    """,

    (

        user1,

        user2,

        user2,

        user1

    )

)

    rows = cursor.fetchall()

    return {
        "messages": [
            {
                "id": row[0],
                "sender": row[1],
                "receiver": row[2],
                "message": (
                    row[3].split("FILE:")[1].split("\n")[0].strip()
                    if row[4] in ["Image", "Voice"] and "FILE:" in row[3]
                    else row[3]
                ),
                "message_type": row[4],
                "created_at": row[5],
                "message_status": row[6]
            }
            for row in rows
        ]
    }
@app.get("/users/{current_user}")
async def get_users(current_user: str):

    cursor.execute(
        """
        SELECT
            username,
            is_blocked,
            warning_count,
            is_online,
            last_seen
        FROM users
        ORDER BY username COLLATE NOCASE
        """
    )

    rows = cursor.fetchall()

    users = []

    for row in rows:

        username = row[0]

        if username == current_user:
            continue

        if (
            current_user.lower() != "admin"
            and username.lower() == "admin"
        ):
            continue

        cursor.execute(
            """
            SELECT COALESCE(MAX(strikes), 0)
            FROM evidence
            WHERE sender = ?
            """,
            (username,)
        )

        strike_count = cursor.fetchone()[0] or 0

        users.append(
            {
                "username": username,
                "strikes": strike_count,
                "status": (
                    "Blocked"
                    if row[1]
                    else "Active"
                ),
                "warning_count": row[2],
                "is_online": bool(row[3]),
                "last_seen": row[4]
            }
        )

    return {
        "users": users
    }
@app.post("/analyze")
async def analyze(data: dict):

    text = data.get("text", "")

    sender = data.get(
        "sender",
        "preview_user"
    )

    receiver = data.get(
        "receiver",
        "preview_receiver"
    )

    evidence_type = data.get(
        "evidence_type",
        "Text"
    )

    result = analyze_text(
        text=text,
        sender=sender,
        receiver=receiver
    )

    bullying = result.get(
        "bullying",
        ""
    )

    analysis_result = (
        "Bullying"
        if (
            bullying
            and "detected" in bullying.lower()
            and "no" not in bullying.lower()
        )
        else "Not Bullying"
    )

    cursor.execute(
        """
        INSERT INTO analysis_history
        (
            sender,
            receiver,
            message,
            analysis_result,
            evidence_type
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            sender,
            receiver,
            text,
            analysis_result,
            evidence_type
        )
    )

    conn.commit()

    return result
@app.post("/report")
async def submit_report(report: Report):

    # -----------------------------
    # Find original message
    # -----------------------------

    cursor.execute(
        """
        SELECT message, message_type
        FROM messages
        WHERE id = ?
        """,
        (report.message_id,)
    )

    row = cursor.fetchone()

    reported_message = report.reported_message

    if row:

        original_message = row[0]
        message_type = row[1]

        if message_type == "Image":

            if "OCR:" in original_message:

                reported_message = (
                    original_message
                    .split("OCR:", 1)[1]
                    .strip()
                )

        elif message_type == "Voice":

            if "TRANSCRIPTION:" in original_message:

                reported_message = (
                    original_message
                    .split("TRANSCRIPTION:", 1)[1]
                    .strip()
                )

        else:

            reported_message = original_message

    cursor.execute(
        """
        INSERT INTO reports
        (
            message_id,
            reporter_user,
            reported_user,
            reported_message,
            reason,
            description,
            context_before,
            context_after
        )
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            report.message_id,
            report.reporter_user,
            report.reported_user,
            reported_message,
            report.reason,
            report.description,
            report.context_before,
            report.context_after
        )
    )

    conn.commit()

    return {
        "message": "Report submitted successfully"
    }
@app.get("/reports")
async def get_reports():

    cursor.execute(
        """
        SELECT *
        FROM reports
        ORDER BY id DESC
        """
    )

    reports = cursor.fetchall()

    return [
        {
            "id": row[0],
            "message_id": row[1],
            "reporter_user": row[2],
            "reported_user": row[3],
            "reported_message": row[4],
            "reason": row[5],
            "description": row[6],
            "context_before": row[7],
            "context_after": row[8],
            "status": row[9],
            "created_at": row[10]
        }
        for row in reports
    ]
@app.get("/report-context/{report_id}")
async def get_report_context(report_id: int):

    # ------------------------------------
    # Get report information
    # ------------------------------------

    cursor.execute(
        """
        SELECT
            message_id,
            reported_message,
            reporter_user,
            reported_user
        FROM reports
        WHERE id = ?
        """,
        (report_id,)
    )

    report = cursor.fetchone()

    if not report:

        return {
            "reported_message": "",
            "context_before": [],
            "context_after": []
        }

    message_id = report[0]
    reported_message = report[1]
    reporter_user = report[2]
    reported_user = report[3]

    # ------------------------------------
    # Load ONLY this conversation
    # ------------------------------------

    cursor.execute(
        """
        SELECT
            id,
            sender,
            receiver,
            message,
            message_type,
            created_at
        FROM messages
        WHERE
        (
            sender=? AND receiver=?
        )
        OR
        (
            sender=? AND receiver=?
        )
        ORDER BY id ASC
        """,
        (
            reporter_user,
            reported_user,
            reported_user,
            reporter_user
        )
    )

    messages = cursor.fetchall()

    index = -1

    # ------------------------------------
    # Locate message using message_id
    # ------------------------------------

    for i, msg in enumerate(messages):

        if msg[0] == message_id:

            index = i

            break

    if index == -1:

        return {

            "reported_message": reported_message,

            "context_before": [],

            "context_after": []

        }
        # ------------------------------------
    # Helper to clean messages
    # ------------------------------------

    def clean_message(row):

        message = row[3]
        message_type = row[4]

        # ----------------------------
        # Image messages
        # ----------------------------

        if message_type == "Image":

            if "OCR:" in message:

                message = message.split(
                    "OCR:",
                    1
                )[1].strip()

            else:

                message = message.replace(
                    "[IMAGE]",
                    ""
                )

                message = message.replace(
                    "[BLOCKED IMAGE]",
                    ""
                )

                message = message.replace(
                    "FILE:",
                    ""
                )

                message = message.strip()

        # ----------------------------
        # Voice messages
        # ----------------------------

        elif message_type == "Voice":

            if "TRANSCRIPTION:" in message:

                message = message.split(
                    "TRANSCRIPTION:",
                    1
                )[1].strip()

            else:

                message = message.replace(
                    "[VOICE]",
                    ""
                )

                message = message.replace(
                    "[BLOCKED VOICE]",
                    ""
                )

                message = message.replace(
                    "FILE:",
                    ""
                )

                message = message.strip()

        return {

            "id": row[0],

            "sender": row[1],

            "receiver": row[2],

            "message": message,

            "message_type": message_type,

            "created_at": row[5]

        }

    # ------------------------------------
    # Build context
    # ------------------------------------

    context_before = [

        clean_message(msg)

        for msg in messages[
            max(0, index - 5):index
        ]

    ]

    context_after = [

        clean_message(msg)

        for msg in messages[
            index + 1:index + 6
        ]

    ]
        # ------------------------------------
    # Return response
    # ------------------------------------

    return {

        "reported_message": clean_message(
            messages[index]
        )["message"],

        "context_before": context_before,

        "context_after": context_after

    }
@app.put("/report/{report_id}/status")
async def update_report_status(
    report_id: int,
    status: str
):

    cursor.execute(
        """
        UPDATE reports
        SET status = ?
        WHERE id = ?
        """,
        (status, report_id)
    )

    conn.commit()

    return {
        "message": f"Report marked as {status}"
    }
@app.put("/user/{username}/warn")
async def warn_user(username: str):

    cursor.execute(
        """
        UPDATE users
        SET warning_count = warning_count + 1
        WHERE username = ?
        """,
        (username,)
    )

    conn.commit()

    return {
        "message": f"{username} warned"
    }


@app.put("/user/{username}/block")
async def block_user(username: str):

    cursor.execute(
        """
        UPDATE users
        SET is_blocked = 1
        WHERE username = ?
        """,
        (username,)
    )

    conn.commit()

    return {
        "message": f"{username} blocked"
    }

@app.put("/user/{username}/unblock")
async def unblock_user(username: str):

    cursor.execute(
        """
        UPDATE users
        SET is_blocked = 0
        WHERE username = ?
        """,
        (username,)
    )

    conn.commit()

    return {
        "message": f"{username} unblocked"
    }

@app.post("/evidence")
async def save_evidence(data: dict):

    sender = data["sender"]

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM evidence
        WHERE sender = ?
        """,
        (sender,)
    )

    previous_strikes = cursor.fetchone()[0]

    strike_count = previous_strikes + 1

    # Strike Logic
    if strike_count >= 10:

        status = "Blocked"

        cursor.execute(
            """
            UPDATE users
            SET is_blocked = 1
            WHERE username = ?
            """,
            (sender,)
        )

    else:

        status = "Warning"

    cursor.execute(
        """
        INSERT INTO evidence
        (
            sender,
            receiver,
            message,
            sentiment,
            emotion,
            ai_result,
            evidence_type,
            strikes,
            status
        )
        VALUES
        (
            ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
        """,
        (
            data["sender"],
            data["receiver"],
            data["message"],
            data["sentiment"],
            data["emotion"],
            data["ai_result"],
            data["evidence_type"],
            strike_count,
            status
        )
    )

    conn.commit()

    return {
        "message": "Evidence saved",
        "strikes": strike_count,
        "status": status
    }
@app.get("/evidence")
async def get_evidence():

    cursor.execute(
        "SELECT * FROM evidence"
    )

    evidence = cursor.fetchall()

    return [
    {
        "id": row[0],
        "sender": row[1],
        "receiver": row[2],
        "message": row[3],
        "sentiment": row[4],
        "emotion": row[5],
        "ai_result": row[6],
        "evidence_type": row[7],
        "strikes": row[8],
        "status": row[9],
        "created_at": row[10]
    }
    for row in evidence
]

@app.get("/export")
async def export_reports():

    cursor.execute(
        """
        SELECT
        reporter_user,
        reported_user,
        reported_message,
        reason,
        description,
        status,
        created_at
        FROM reports
        """
    )

    reports = cursor.fetchall()

    df = pd.DataFrame(
        reports,
        columns=[
            "Reporter",
            "Reported User",
            "Reported Message",
            "Reason",
            "Description",
            "Status",
            "Created At"
        ]
    )

    file_name = "cybershield-ai-reports.xlsx"

    df.to_excel(file_name, index=False)

    return FileResponse(
        file_name,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename=file_name
    )
from fastapi import Form

@app.post("/image")
async def image(
    sender: str = Form(...),
    receiver: str = Form(...),
    file: UploadFile = File(...)
):

    # ----------------------------
    # Check sender
    # ----------------------------

    cursor.execute(
        """
        SELECT is_blocked
        FROM users
        WHERE username = ?
        """,
        (sender,)
    )

    row = cursor.fetchone()

    if row and row[0] == 1:

        return {
            "success": False,
            "status": "blocked",
            "message": "Your account is blocked."
        }

    # ----------------------------
    # Check receiver
    # ----------------------------

    cursor.execute(
        """
        SELECT is_blocked
        FROM users
        WHERE username = ?
        """,
        (receiver,)
    )

    row = cursor.fetchone()

    if row and row[0] == 1:

        return {
            "success": False,
            "status": "blocked",
            "message": "Receiver is blocked."
        }

    file_path = f"uploads/images/{file.filename}"

    with open(file_path, "wb") as buffer:

        shutil.copyfileobj(file.file, buffer)

    img = Image.open(file_path)

    analysis = analyze_image(
    img=img,
    sender=sender,
    receiver=receiver
)

    if analysis.get("success"):

      bullying = (
        analysis["analysis"]
        .get("bullying", "")
    )

    analysis_result = (
        "Bullying"
        if (
            bullying
            and "detected" in bullying.lower()
            and "no" not in bullying.lower()
        )
        else "Not Bullying"
    )

    cursor.execute(
        """
        INSERT INTO analysis_history
        (
            sender,
            receiver,
            message,
            analysis_result,
            evidence_type
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            sender,
            receiver,
            analysis.get(
                "extracted_text",
                ""
            ),
            analysis_result,
            "Image"
        )
    )

    conn.commit()

    return {
        "file_path": file_path,
        "analysis": analysis
    }

    return analysis
 
@app.post("/image-evidence")
async def save_image_evidence(data: dict):

    sender = data["sender"]

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM evidence
        WHERE sender = ?
        """,
        (sender,)
    )

    previous = cursor.fetchone()[0]

    strikes = previous + 1

    status = (
        "Blocked"
        if strikes >= 10
        else "Warning"
    )

    cursor.execute(
    """
    INSERT INTO evidence
    (
        sender,
        receiver,
        message,
        sentiment,
        emotion,
        ai_result,
        evidence_type,
        strikes,
        status
    )
    VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
    (
        data["sender"],
        data["receiver"],
        data.get(
            "ocr_text",
            data.get("message", "")
        ),
        data.get("sentiment", ""),
        data.get("emotion", ""),
        data.get("ai_result", ""),
        "Image",
        strikes,
        status
    )
)
    if strikes >= 10:
        cursor.execute(
            """
            UPDATE users
            SET is_blocked = 1
            WHERE username = ?
            """,
            (sender,)
        )

    conn.commit()

    return {
        "message": "Image evidence saved",
        "status": status,
        "strikes": strikes
    }

from fastapi import Form

@app.post("/voice")
async def voice(
    sender: str = Form(...),
    receiver: str = Form(...),
    file: UploadFile = File(...)
):

    # ----------------------------
    # Check sender
    # ----------------------------

    cursor.execute(
        """
        SELECT is_blocked
        FROM users
        WHERE username = ?
        """,
        (sender,)
    )

    row = cursor.fetchone()

    if row and row[0] == 1:

        return {
            "success": False,
            "status": "blocked",
            "message": "Your account is blocked."
        }

    # ----------------------------
    # Check receiver
    # ----------------------------

    cursor.execute(
        """
        SELECT is_blocked
        FROM users
        WHERE username = ?
        """,
        (receiver,)
    )

    row = cursor.fetchone()

    if row and row[0] == 1:

        return {
            "success": False,
            "status": "blocked",
            "message": "Receiver is blocked."
        }

    file_path = f"uploads/voices/{file.filename}"

    with open(file_path, "wb") as buffer:

        shutil.copyfileobj(file.file, buffer)

    analysis = analyze_voice(
    file_path=file_path,
    sender=sender,
    receiver=receiver
)

    if analysis.get("success"):

      bullying = (
        analysis["analysis"]
        .get("bullying", "")
    )

    analysis_result = (
        "Bullying"
        if (
            bullying
            and "detected" in bullying.lower()
            and "no" not in bullying.lower()
        )
        else "Not Bullying"
    )

    cursor.execute(
        """
        INSERT INTO analysis_history
        (
            sender,
            receiver,
            message,
            analysis_result,
            evidence_type
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            sender,
            receiver,
            analysis.get(
                "transcription",
                ""
            ),
            analysis_result,
            "Voice"
        )
    )

    conn.commit()

    return {
    "file_path": file_path,
    "analysis": analysis
    }
    return analysis
@app.post("/voice-evidence")
async def save_voice_evidence(data: dict):

    sender = data["sender"]

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM evidence
        WHERE sender = ?
        """,
        (sender,)
    )

    previous = cursor.fetchone()[0]

    strikes = previous + 1

    status = (
        "Blocked"
        if strikes >= 10
        else "Warning"
    )

    cursor.execute(
    """
    INSERT INTO evidence
    (
        sender,
        receiver,
        message,
        sentiment,
        emotion,
        ai_result,
        evidence_type,
        strikes,
        status
    )
    VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
    (
        data["sender"],
        data["receiver"],
        data.get(
            "transcription",
            data.get("message", "")
        ),
        data.get("sentiment", ""),
        data.get("emotion", ""),
        data.get("ai_result", ""),
        "Voice",
        strikes,
        status
    )
)
    if strikes >= 10:
        cursor.execute(
            """
            UPDATE users
            SET is_blocked = 1
            WHERE username = ?
            """,
            (sender,)
        )

    conn.commit()

    return {
        "message": "Voice evidence saved",
        "status": status,
        "strikes": strikes
    }
@app.post("/send-image")
async def send_image(data: dict):

    cursor.execute(
        "SELECT is_blocked FROM users WHERE username=?",
        (data["sender"],)
    )

    sender = cursor.fetchone()

    cursor.execute(
        "SELECT is_blocked FROM users WHERE username=?",
        (data["receiver"],)
    )

    receiver = cursor.fetchone()

    if sender and sender[0] == 1:

        return {
            "success": False,
            "message": "Your account is blocked."
        }

    if receiver and receiver[0] == 1:

        return {
            "success": False,
            "message": "Receiver is blocked."
        }

    blocked = data.get("blocked", False)

    if blocked:

        message = f"""[BLOCKED IMAGE]
FILE:{data["image_path"]}
OCR:{data.get("ocr_text", "")}"""

        status = "Blocked"

        message_status = "Blocked"

    else:

        message = f"""[IMAGE]
FILE:{data["image_path"]}
OCR:{data.get("ocr_text", "")}"""

        status = "Delivered"

        message_status = "Sent"

    cursor.execute(
        """
        INSERT INTO messages
        (
            sender,
            receiver,
            message,
            message_type,
            status,
            message_status
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            data["sender"],
            data["receiver"],
            message,
            "Image",
            status,
            message_status
        )
    )

    conn.commit()

    if (
        not blocked
        and
        data["receiver"] in active_connections
    ):

        await active_connections[
            data["receiver"]
        ].send_json(
            {
                "type": "message",
                "sender": data["sender"],
                "receiver": data["receiver"]
            }
        )

    return {
        "success": True
    }
    
@app.post("/send-voice")
async def send_voice(data: dict):

    cursor.execute(
        "SELECT is_blocked FROM users WHERE username=?",
        (data["sender"],)
    )

    sender = cursor.fetchone()

    cursor.execute(
        "SELECT is_blocked FROM users WHERE username=?",
        (data["receiver"],)
    )

    receiver = cursor.fetchone()

    if sender and sender[0] == 1:

        return {
            "success": False,
            "message": "Your account is blocked."
        }

    if receiver and receiver[0] == 1:

        return {
            "success": False,
            "message": "Receiver is blocked."
        }

    blocked = data.get("blocked", False)

    if blocked:

        message = f"""[BLOCKED VOICE]
FILE:{data["voice_path"]}
TRANSCRIPTION:{data.get("transcription", "")}"""

        status = "Blocked"

        message_status = "Blocked"

    else:

        message = f"""[VOICE]
FILE:{data["voice_path"]}
TRANSCRIPTION:{data.get("transcription", "")}"""

        status = "Delivered"

        message_status = "Sent"

    cursor.execute(
        """
        INSERT INTO messages
        (
            sender,
            receiver,
            message,
            message_type,
            status,
            message_status
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            data["sender"],
            data["receiver"],
            message,
            "Voice",
            status,
            message_status
        )
    )

    conn.commit()

    if (
        not blocked
        and
        data["receiver"] in active_connections
    ):

        await active_connections[
            data["receiver"]
        ].send_json(
            {
                "type": "message",
                "sender": data["sender"],
                "receiver": data["receiver"]
            }
        )

    return {
        "success": True
    }
@app.get("/analysis-history")
async def get_analysis_history():

    cursor.execute(
        """
        SELECT
            id,
            sender,
            receiver,
            message,
            analysis_result,
            evidence_type,
            created_at
        FROM analysis_history
        ORDER BY id DESC
        """
    )

    rows = cursor.fetchall()

    return [
        {
            "id": row[0],
            "sender": row[1],
            "receiver": row[2],
            "message": row[3],
            "analysis_result": row[4],
            "evidence_type": row[5],
            "created_at": row[6]
        }
        for row in rows
    ]
@app.get("/dashboard-stats")
async def dashboard_stats():

    # ------------------------
    # Active Users
    # ------------------------

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM users
        WHERE is_online = 1
        """
    )

    active_users = cursor.fetchone()[0]

    # ------------------------
    # AI Evidence
    # ------------------------

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM evidence
        """
    )

    ai_evidence = cursor.fetchone()[0]

    # ------------------------
    # Reports
    # ------------------------

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM reports
        """
    )

    reports_received = cursor.fetchone()[0]

    # ------------------------
    # Messages Analysed
    # ------------------------

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM analysis_history
        """
    )

    messages_analysed = cursor.fetchone()[0]

    return {

        "active_users": active_users,

        "messages_blocked": ai_evidence,

        "ai_evidence": ai_evidence,

        "reports_received": reports_received,

        "messages_analysed": messages_analysed

    }
@app.get("/")
def home():
    return {"message": "cybershield-ai API running 🚀"}
print("this main.py is running")
from fastapi import Request
from fastapi.responses import PlainTextResponse

VERIFY_TOKEN = "cybershield123"

@app.get("/webhook")
async def verify_webhook(request: Request):
    hub_mode = request.query_params.get("hub.mode")
    hub_verify_token = request.query_params.get("hub.verify_token")
    hub_challenge = request.query_params.get("hub.challenge")
    print("MODE:", hub_mode)
    print("TOKEN:", hub_verify_token)
    print("EXPECTED:", VERIFY_TOKEN)
    print("CHALLENGE:", hub_challenge)
    if hub_mode == "subscribe" and hub_verify_token == VERIFY_TOKEN:
        return PlainTextResponse(content=hub_challenge)

    return PlainTextResponse(
        content="Verification failed",
        status_code=403
    )
@app.post("/webhook")
async def receive_webhook(request: Request):

    data = await request.json()
    import json


    print("========== FULL WEBHOOK ==========")
    print(json.dumps(data,indent=4))
    print("==================================")

    try:

        for entry in data.get("entry", []):

            # ==========================
            # DM / MESSAGE EVENTS
            # ==========================
            for msg in entry.get("messaging", []):

                sender_id = msg.get("sender", {}).get("id")
                recipient_id = msg.get("recipient", {}).get("id")

                print(f"SENDER: {sender_id}")
                print(f"RECIPIENT: {recipient_id}")

                if "message" in msg:

                    message_text = msg["message"].get("text", "")

                    print("MESSAGE:", message_text)

                    result = analyze_text(message_text)

                    print("ANALYSIS RESULT:")
                    print(result)

                    if (
                        "detected" in result.get("bullying", "").lower()
                        and "no" not in result.get("bullying", "").lower()
                    ):

                        cursor.execute(
                            """
                            INSERT INTO reports (name, email, description)
                            VALUES (?, ?, ?)
                            """,
                            (
                                "Instagram User",
                                "instagram@webhook.com",
                                message_text
                            )
                        )

                        conn.commit()

                        print("✅ BULLYING DETECTED")
                        print("✅ Saved bullying report")

                    else:
                        print("✅ NOT BULLYING")

            # ==========================
            # COMMENT EVENTS
            # ==========================
            for change in entry.get("changes", []):

                value = change.get("value", {})

                if "text" in value:

                    comment_text = value.get("text", "")

                    print("COMMENT:", comment_text)

                    result = analyze_text(comment_text)

                    print("COMMENT ANALYSIS:")
                    print(result)

                    if (
                        "detected" in result.get("bullying", "").lower()
                        and "no" not in result.get("bullying", "").lower()
                    ):

                        cursor.execute(
                            """
                            INSERT INTO reports (name, email, description)
                            VALUES (?, ?, ?)
                            """,
                            (
                                "Instagram Comment",
                                "instagram@comment.com",
                                comment_text
                            )
                        )

                        conn.commit()

                        print("✅ COMMENT BULLYING DETECTED")
                        print("✅ Saved comment report")

    except Exception as e:
        print("ERROR:", e)

    return {"status": "ok"}