
import sqlite3
conn = sqlite3.connect("app.db", check_same_thread=False)
cursor = conn.cursor()

cursor.execute('''CREATE TABLE IF NOT EXISTS users (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 email TEXT UNIQUE,
 password TEXT
)''')

cursor.execute('''CREATE TABLE IF NOT EXISTS downloads (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_email TEXT,
 filename TEXT,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)''')

conn.commit()
