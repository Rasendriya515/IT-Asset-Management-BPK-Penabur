import sys
import os

# Setup environment agar bisa import module aplikasi
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

def create_operator_account():
    db = SessionLocal()
    try:
        # Data Akun Operator
        email = "operator@penabur.id"
        password = "operator123"
        full_name = "Staff Operator"
        role = "operator"

        # Cek apakah user sudah ada
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"❌ User dengan email {email} sudah ada di database!")
            return

        # Buat user baru dengan password yang sudah di-hash
        new_operator = User(
            email=email,
            full_name=full_name,
            hashed_password=get_password_hash(password), # Enkripsi password disini
            role=role,
            is_active=True,
            avatar=None
        )

        db.add(new_operator)
        db.commit()
        
        print("\n===========================================")
        print("✅ AKUN OPERATOR BERHASIL DIBUAT!")
        print("===========================================")
        print(f"Email    : {email}")
        print(f"Password : {password}")
        print(f"Role     : {role}")
        print("===========================================\n")

    except Exception as e:
        print(f"❌ Terjadi error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_operator_account()