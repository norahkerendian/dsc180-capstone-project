from db.database import SessionLocal
from db.models import Question

def list_questions():
    db = SessionLocal()
    results = db.query(Question).all()
    for q in results:
        print(q.question)
    db.close()

if __name__ == "__main__":
    list_questions()
