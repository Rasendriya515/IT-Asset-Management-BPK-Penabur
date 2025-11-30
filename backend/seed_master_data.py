import sys
import os

# Setup environment agar bisa import app module
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.models.master import MasterOption

# DATA LENGKAP DARI assetData.js (Termasuk Subcategory)
INITIAL_DATA = [
    # CITIES
    {"category": "CITY", "code": "00", "label": "Yayasan"},
    {"category": "CITY", "code": "01", "label": "Jakarta"},
    {"category": "CITY", "code": "02", "label": "Bandar Lampung"},
    {"category": "CITY", "code": "03", "label": "Bandung"},
    {"category": "CITY", "code": "04", "label": "Bogor"},
    {"category": "CITY", "code": "05", "label": "Cianjur"},
    {"category": "CITY", "code": "06", "label": "Cicurug"},
    {"category": "CITY", "code": "07", "label": "Cimahi"},
    {"category": "CITY", "code": "08", "label": "Cirebon"},
    {"category": "CITY", "code": "09", "label": "Indramayu"},
    {"category": "CITY", "code": "10", "label": "Jatibarang"},
    {"category": "CITY", "code": "11", "label": "Metro"},
    {"category": "CITY", "code": "12", "label": "Rengasdengklok"},
    {"category": "CITY", "code": "13", "label": "Serang"},
    {"category": "CITY", "code": "14", "label": "Sukabumi"},
    {"category": "CITY", "code": "15", "label": "Tasikmalaya"},
    {"category": "CITY", "code": "16", "label": "Tangerang"},
    {"category": "CITY", "code": "99", "label": "Tirtamarta"},

    # ASSET TYPES
    {"category": "ASSET_TYPE", "code": "HW", "label": "Hardware"},
    {"category": "ASSET_TYPE", "code": "MP", "label": "Mobile/Portable"},
    {"category": "ASSET_TYPE", "code": "NI", "label": "Network/Infrastructure"},
    {"category": "ASSET_TYPE", "code": "SD", "label": "Server/Data Center"},
    {"category": "ASSET_TYPE", "code": "SS", "label": "Software/Subscriptions"},
    {"category": "ASSET_TYPE", "code": "PA", "label": "Peripherals & Accessories"},
    {"category": "ASSET_TYPE", "code": "IT", "label": "IoT"},

    # ASSET CATEGORIES (Parent: HW)
    {"category": "ASSET_CATEGORY", "code": "LTP", "label": "Laptop", "parent_code": "HW"},
    {"category": "ASSET_CATEGORY", "code": "CPU", "label": "PC / CPU", "parent_code": "HW"},
    {"category": "ASSET_CATEGORY", "code": "AIO", "label": "All In One", "parent_code": "HW"},
    {"category": "ASSET_CATEGORY", "code": "KSK", "label": "Kiosk", "parent_code": "HW"},
    
    # ASSET CATEGORIES (Parent: MP)
    {"category": "ASSET_CATEGORY", "code": "TAB", "label": "Tablet", "parent_code": "MP"},
    {"category": "ASSET_CATEGORY", "code": "SMA", "label": "Smartphone", "parent_code": "MP"},
    {"category": "ASSET_CATEGORY", "code": "MBP", "label": "Mobile Barcode Phone", "parent_code": "MP"},
    {"category": "ASSET_CATEGORY", "code": "HHS", "label": "Handheld Scanner", "parent_code": "MP"},
    {"category": "ASSET_CATEGORY", "code": "GPS", "label": "GPS Unit", "parent_code": "MP"},

    # ASSET CATEGORIES (Parent: NI)
    {"category": "ASSET_CATEGORY", "code": "RTR", "label": "Router", "parent_code": "NI"},
    {"category": "ASSET_CATEGORY", "code": "SWI", "label": "Switch", "parent_code": "NI"},
    {"category": "ASSET_CATEGORY", "code": "FIR", "label": "Firewall", "parent_code": "NI"},
    {"category": "ASSET_CATEGORY", "code": "ACC", "label": "Access Point", "parent_code": "NI"},
    {"category": "ASSET_CATEGORY", "code": "PPL", "label": "Patch Panel", "parent_code": "NI"},
    {"category": "ASSET_CATEGORY", "code": "RAC", "label": "Rack", "parent_code": "NI"},
    {"category": "ASSET_CATEGORY", "code": "UPS", "label": "UPS", "parent_code": "NI"},
    {"category": "ASSET_CATEGORY", "code": "PDU", "label": "PDU", "parent_code": "NI"},

    # ASSET CATEGORIES (Parent: SD)
    {"category": "ASSET_CATEGORY", "code": "PHS", "label": "Physical Server", "parent_code": "SD"},
    {"category": "ASSET_CATEGORY", "code": "CLS", "label": "Cloud Server", "parent_code": "SD"},
    {"category": "ASSET_CATEGORY", "code": "NAS", "label": "SAN/NAS", "parent_code": "SD"},

    # ASSET CATEGORIES (Parent: SS)
    {"category": "ASSET_CATEGORY", "code": "IHS", "label": "In House", "parent_code": "SS"},
    {"category": "ASSET_CATEGORY", "code": "OPL", "label": "On-premise license", "parent_code": "SS"},
    {"category": "ASSET_CATEGORY", "code": "SAS", "label": "Software as A Service", "parent_code": "SS"},
    {"category": "ASSET_CATEGORY", "code": "IAS", "label": "Infrastructure as A Service", "parent_code": "SS"},
    {"category": "ASSET_CATEGORY", "code": "PAS", "label": "Platform as A Service", "parent_code": "SS"},
    {"category": "ASSET_CATEGORY", "code": "VMI", "label": "Virtual Machine Image", "parent_code": "SS"},
    {"category": "ASSET_CATEGORY", "code": "CDK", "label": "Container-Docker / Kubernetes", "parent_code": "SS"},
    {"category": "ASSET_CATEGORY", "code": "API", "label": "API Key", "parent_code": "SS"},

    # ASSET CATEGORIES (Parent: PA)
    {"category": "ASSET_CATEGORY", "code": "MON", "label": "Monitor", "parent_code": "PA"},
    {"category": "ASSET_CATEGORY", "code": "KEY", "label": "Keyboard", "parent_code": "PA"},
    {"category": "ASSET_CATEGORY", "code": "MOS", "label": "Mouse", "parent_code": "PA"},
    {"category": "ASSET_CATEGORY", "code": "DOC", "label": "Docking Station", "parent_code": "PA"},
    {"category": "ASSET_CATEGORY", "code": "SCN", "label": "Scanner", "parent_code": "PA"},
    {"category": "ASSET_CATEGORY", "code": "PJR", "label": "Projector", "parent_code": "PA"},
    {"category": "ASSET_CATEGORY", "code": "PRI", "label": "Printer", "parent_code": "PA"},
    {"category": "ASSET_CATEGORY", "code": "HEA", "label": "Headset", "parent_code": "PA"},
    {"category": "ASSET_CATEGORY", "code": "SPR", "label": "Speaker (Speaker PC)", "parent_code": "PA"},
    {"category": "ASSET_CATEGORY", "code": "WBM", "label": "Webcam", "parent_code": "PA"},
    {"category": "ASSET_CATEGORY", "code": "VRH", "label": "VR Headset", "parent_code": "PA"},

    # ASSET CATEGORIES (Parent: IT)
    {"category": "ASSET_CATEGORY", "code": "CTV", "label": "CCTV", "parent_code": "IT"},
    {"category": "ASSET_CATEGORY", "code": "FIP", "label": "Fingerprint", "parent_code": "IT"},
    {"category": "ASSET_CATEGORY", "code": "NFC", "label": "RFID Reader", "parent_code": "IT"},
    {"category": "ASSET_CATEGORY", "code": "IFP", "label": "Interactive Flat Panel", "parent_code": "IT"},
    {"category": "ASSET_CATEGORY", "code": "STV", "label": "Smart TV", "parent_code": "IT"},
    {"category": "ASSET_CATEGORY", "code": "VID", "label": "Videotron", "parent_code": "IT"},

    # --- BAGIAN YANG BARU DITAMBAHKAN (JENIS ASET / SUBCATEGORIES) ---
    
    # SUBCATEGORIES (Parent: CTV - CCTV)
    {"category": "ASSET_SUBCATEGORY", "code": "NVR", "label": "NVR", "parent_code": "CTV"},
    {"category": "ASSET_SUBCATEGORY", "code": "DVR", "label": "DVR", "parent_code": "CTV"},
    {"category": "ASSET_SUBCATEGORY", "code": "IPO", "label": "CCTV IP Outdoor", "parent_code": "CTV"},
    {"category": "ASSET_SUBCATEGORY", "code": "IPI", "label": "CCTV IP Indoor", "parent_code": "CTV"},
    {"category": "ASSET_SUBCATEGORY", "code": "ANI", "label": "Analog Indoor", "parent_code": "CTV"},
    {"category": "ASSET_SUBCATEGORY", "code": "ANO", "label": "Analog Outdoor", "parent_code": "CTV"},

    # SUBCATEGORIES (Parent: CLS - Cloud Server)
    {"category": "ASSET_SUBCATEGORY", "code": "ABB", "label": "Alibaba", "parent_code": "CLS"},
    {"category": "ASSET_SUBCATEGORY", "code": "AWS", "label": "AWS", "parent_code": "CLS"},
    {"category": "ASSET_SUBCATEGORY", "code": "AZR", "label": "Azure", "parent_code": "CLS"},
    {"category": "ASSET_SUBCATEGORY", "code": "ERA", "label": "Eranyacloud", "parent_code": "CLS"},
    {"category": "ASSET_SUBCATEGORY", "code": "GCP", "label": "Google Cloud", "parent_code": "CLS"},

    # SUBCATEGORIES (Parent: NAS - SAN/NAS)
    {"category": "ASSET_SUBCATEGORY", "code": "DES", "label": "Desktop", "parent_code": "NAS"},
    {"category": "ASSET_SUBCATEGORY", "code": "MOU", "label": "Mounting", "parent_code": "NAS"},
    {"category": "ASSET_SUBCATEGORY", "code": "HDD", "label": "HDD Data", "parent_code": "NAS"},
    {"category": "ASSET_SUBCATEGORY", "code": "HDS", "label": "HDD Surveillance", "parent_code": "NAS"},
    {"category": "ASSET_SUBCATEGORY", "code": "SSD", "label": "SSD", "parent_code": "NAS"},
    {"category": "ASSET_SUBCATEGORY", "code": "RAM", "label": "RAM", "parent_code": "NAS"},

    # SUBCATEGORIES (Parent: KEY - Keyboard)
    {"category": "ASSET_SUBCATEGORY", "code": "KBL", "label": "Wired", "parent_code": "KEY"},
    {"category": "ASSET_SUBCATEGORY", "code": "WLS", "label": "Wireless", "parent_code": "KEY"},

    # SUBCATEGORIES (Parent: PRI - Printer)
    {"category": "ASSET_SUBCATEGORY", "code": "INK", "label": "Ink", "parent_code": "PRI"},
    {"category": "ASSET_SUBCATEGORY", "code": "LSR", "label": "Laser", "parent_code": "PRI"},

    # FLOORS
    {"category": "FLOOR", "code": "B3", "label": "B3"},
    {"category": "FLOOR", "code": "B2", "label": "B2"},
    {"category": "FLOOR", "code": "B1", "label": "B1"},
    {"category": "FLOOR", "code": "01", "label": "01"},
    {"category": "FLOOR", "code": "02", "label": "02"},
    {"category": "FLOOR", "code": "03", "label": "03"},
    {"category": "FLOOR", "code": "04", "label": "04"},
    {"category": "FLOOR", "code": "05", "label": "05"},
    {"category": "FLOOR", "code": "06", "label": "06"},
    {"category": "FLOOR", "code": "07", "label": "07"},
    {"category": "FLOOR", "code": "08", "label": "08"},
    {"category": "FLOOR", "code": "09", "label": "09"},
    {"category": "FLOOR", "code": "10", "label": "10"},
    {"category": "FLOOR", "code": "11", "label": "11"},
    {"category": "FLOOR", "code": "12", "label": "12"},
    {"category": "FLOOR", "code": "13", "label": "13"},
    {"category": "FLOOR", "code": "14", "label": "14"},
    {"category": "FLOOR", "code": "15", "label": "15"},
    
    # PLACEMENT
    {"category": "PLACEMENT", "code": "IN", "label": "Indoor"},
    {"category": "PLACEMENT", "code": "OUT", "label": "Outdoor"},

    # STATUS ASET
    {"category": "ASSET_STATUS", "code": "OK", "label": "Berfungsi"},
    {"category": "ASSET_STATUS", "code": "WARN", "label": "Terkendala"},
    {"category": "ASSET_STATUS", "code": "REP", "label": "Perbaikan"},
    {"category": "ASSET_STATUS", "code": "BAD", "label": "Rusak"},
    {"category": "ASSET_STATUS", "code": "DEL", "label": "Dihapuskan"},

    # VENDOR (Contoh)
    {"category": "VENDOR", "code": "GRO", "label": "GROTECH"},
    {"category": "VENDOR", "code": "FIK", "label": "FIKACIA"},
    {"category": "VENDOR", "code": "VVC", "label": "VV COMPUTER"},
    
    # SERVICE STATUS
    {"category": "SERVICE_STATUS", "code": "PRG", "label": "Progress"},
    {"category": "SERVICE_STATUS", "code": "CLR", "label": "Clear"},
    {"category": "SERVICE_STATUS", "code": "MEM", "label": "MEMO"},
    {"category": "SERVICE_STATUS", "code": "GAR", "label": "GARANSI"},
]

def seed_data():
    db = SessionLocal()
    print("Mulai seeding master data...")
    count = 0
    try:
        for item in INITIAL_DATA:
            # Cek apakah data sudah ada agar tidak duplikat
            exists = db.query(MasterOption).filter(
                MasterOption.category == item["category"],
                MasterOption.code == item["code"]
            ).first()
            
            if not exists:
                new_opt = MasterOption(**item)
                db.add(new_opt)
                count += 1
        
        db.commit()
        print(f"Selesai! {count} data baru berhasil ditambahkan.")
    except Exception as e:
        print(f"Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()