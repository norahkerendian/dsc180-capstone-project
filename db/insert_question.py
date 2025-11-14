import json
from db.database import SessionLocal
from db.sqlmodel import Question


def insert_questions(path):
    db = SessionLocal()
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    for item in data:
        q = Question(question=item["question"], answer=item["answer"])
        db.add(q)

    db.commit()
    db.close()
    print("Done!")


if __name__ == "__main__":
    insert_questions("AIGeneratedData_json/generated_level1_11Nov 5, 2025_105626.json")
