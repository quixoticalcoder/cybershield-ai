import sqlite3

conn = sqlite3.connect(
    "reports.db",
    check_same_thread=False
)

cursor = conn.cursor()