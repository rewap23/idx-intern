import os, smtplib
from dotenv import load_dotenv
import mysql.connector
from google import genai

load_dotenv()

# MySQL
conn = mysql.connector.connect(
    host=os.getenv("MYSQL_HOST"), user=os.getenv("MYSQL_USER"),
    password=os.getenv("MYSQL_PASSWORD"), database=os.getenv("MYSQL_DATABASE"))
cur = conn.cursor()
cur.execute("SELECT COUNT(*) FROM rets_property")
print("MySQL OK, active listings:", cur.fetchone()[0])
cur.execute("SELECT COUNT(*) FROM california_sold")
print("MySQL OK, sold comps:", cur.fetchone()[0])
conn.close()

# Gemini
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
try:
    r = client.models.generate_content(model=model, contents="Reply with the word OK")
    print(f"Gemini OK ({model}):", r.text.strip())
except Exception as e:
    print(f"Gemini call failed with {model}: {e}")
    print("Models available to your key:")
    for m in client.models.list():
        print("  ", m.name)

# Email (Gmail SMTP)
with smtplib.SMTP_SSL("smtp.gmail.com", 465) as s:
    s.login(os.getenv("EMAIL_USER"), os.getenv("EMAIL_PASSWORD"))
    print("Email login OK")