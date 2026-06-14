# DotSign — Document Signature App

> A DocuSign-like digital signature system built with Python (FastAPI) + Next.js + Supabase

![DotSign Banner](https://img.shields.io/badge/DotSign-v1.0-blue?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?style=for-the-badge&logo=fastapi)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)
![PyMuPDF](https://img.shields.io/badge/PyMuPDF-PDF_Signing-orange?style=for-the-badge)

---

## 📌 About

**DotSign** is a full-stack document signing application that allows users to:
- Upload PDF documents
- Draw and place digital signatures
- Share signing links via email
- Download signed PDFs with embedded signatures
- Track all actions via an audit trail

Built as a portfolio project to demonstrate enterprise-grade backend engineering with Python.

---

## 🎯 Features

| Feature | Description |
|---|---|
| 🔐 Authentication | Supabase Auth — JWT-based, UUID stored securely in DB |
| 📄 PDF Upload | Upload PDFs up to 25 MB to Supabase Storage |
| ✍️ Draw Signature | Canvas-based signature drawing |
| 📍 Place & Drag | Place signature anywhere on PDF, drag to reposition |
| 🖊️ PDF Signing | PyMuPDF embeds signature directly into PDF |
| 🔗 Public Link | Generate tokenized signing links for external signers |
| 📋 Audit Trail | Every action logged with timestamp, IP, and user |
| 👤 Profile | User profile with member since date |
| 📥 Download | Download original and signed PDF |

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 16** — App Router
- **Material UI (MUI v5)** — UI components with `sx` prop
- **Supabase JS** — Auth + Storage
- **Axios** — API calls with JWT interceptor

### Backend
- **FastAPI** — High-performance Python API
- **Uvicorn** — ASGI server
- **PyMuPDF (fitz)** — PDF manipulation and signature embedding
- **Supabase Python** — Database + Storage
- **python-jose** — JWT handling

### Database & Storage
- **Supabase PostgreSQL** — users, audit_logs, signing_links tables
- **Supabase Storage** — PDF file storage (documents bucket)
- **Supabase Auth** — User authentication (UUID generated silently)

---

## 📁 Project Structure

```
DotSign/
├── frontend/                   # Next.js App
│   ├── app/
│   │   ├── dashboard/          # Protected dashboard pages
│   │   │   ├── page.jsx        # Dashboard with stats
│   │   │   ├── layout.jsx      # Sidebar + Navbar layout
│   │   │   ├── documents/      # Document list, upload, viewer
│   │   │   ├── audit/          # Audit trail page
│   │   │   └── profile/        # User profile
│   │   ├── login/              # Login page
│   │   ├── register/           # Register page
│   │   └── sign/[token]/       # Public signing page
│   ├── components/
│   │   ├── layout/             # Sidebar, Navbar, ProtectedRoute
│   │   ├── signature/          # SignatureCanvas component
│   │   └── documents/          # DocumentCard, PdfViewer etc
│   ├── lib/
│   │   ├── supabase.js         # Supabase client
│   │   ├── axios.js            # Axios instance + JWT interceptor
│   │   └── theme.js            # MUI custom theme
│   ├── context/
│   │   └── AuthContext.jsx     # Global auth state
│   └── hooks/                  # Custom React hooks
│
├── backend/                    # FastAPI App
│   ├── main.py                 # FastAPI app + CORS
│   ├── database.py             # SQLAlchemy setup
│   ├── routers/
│   │   ├── auth.py             # Register + /me endpoints
│   │   ├── documents.py        # PDF sign endpoint (PyMuPDF)
│   │   ├── signatures.py       # Public signing links
│   │   └── audit.py            # Audit log endpoints
│   ├── models/                 # SQLAlchemy models
│   ├── schemas/                # Pydantic schemas
│   ├── middleware/
│   │   └── auth_middleware.py  # JWT token decoder
│   └── utils/                  # Helper utilities
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Supabase account (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/dotsign.git
cd dotsign
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to **Authentication → Sign In / Providers → Email** → Turn OFF **Confirm email** (for development)
3. Go to **Storage** → Create bucket named `documents` → Enable public access
4. Run these SQL queries in **SQL Editor**:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY,
    name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    user_email VARCHAR,
    document_name VARCHAR,
    action VARCHAR NOT NULL,
    ip_address VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Signing links table
CREATE TABLE IF NOT EXISTS public.signing_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token VARCHAR UNIQUE NOT NULL,
    document_name VARCHAR NOT NULL,
    owner_id UUID NOT NULL,
    owner_email VARCHAR,
    signer_email VARCHAR,
    status VARCHAR DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days')
);
```

5. Go to **Storage → Policies** → Run:

```sql
CREATE POLICY "allow authenticated uploads"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run frontend:
```bash
npm run dev
```

### 4. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # Mac/Linux

pip install fastapi uvicorn sqlalchemy psycopg2-binary python-jose passlib bcrypt python-multipart pymupdf pillow supabase python-dotenv pydantic[email]
```

Create `.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here
DATABASE_URL=postgresql://postgres.yourproject:password@host:6543/postgres
JWT_SECRET=your_jwt_secret_here
```

Run backend:
```bash
uvicorn main:app --reload --port 8000
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user in DB |
| GET | `/api/auth/me` | Get current user |

### Documents
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/docs/sign` | Sign PDF with PyMuPDF |

### Signatures
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/signatures/create-link` | Generate public signing link |
| GET | `/api/signatures/verify/{token}` | Verify signing token |
| POST | `/api/signatures/sign-with-token` | Sign via public link |

### Audit
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/audit/log` | Log an action |
| GET | `/api/audit/all/me` | Get all my audit logs |
| GET | `/api/audit/{doc_name}` | Get logs for a document |

---

## 🌐 Deployment

### Frontend → Vercel
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Set environment variables (same as `.env.local`)
4. Deploy!

### Backend → Render
1. Go to [render.com](https://render.com) → New Web Service
2. Connect GitHub repo
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables
6. Deploy!

---

## 📸 Screenshots
<img width="1901" height="810" alt="image" src="https://github.com/user-attachments/assets/4a1c5f01-f0c8-41c9-8b9f-5c4b0892f040" />

### Dashboard
- Real-time document stats (total, pending, signed)
- Quick upload button
<img width="1915" height="809" alt="image" src="https://github.com/user-attachments/assets/a7896af9-4a95-45a0-a292-7a931aaad4eb" />

### Document Viewer
- PDF preview with signature overlay
- Draw signature on canvas
- Drag and place anywhere on PDF
- Finalize and download signed PDF
<img width="1920" height="808" alt="image" src="https://github.com/user-attachments/assets/54a87593-15c5-4976-8bb0-7808758992ae" />

### Audit Trail
- All actions logged with timestamp (IST)
- IP address tracking
- Action type badges (Viewed, Signed)
<img width="1894" height="772" alt="image" src="https://github.com/user-attachments/assets/51edc611-1fa4-4a50-9e70-a208af0b34cb" />

### Public Signing
- No login required for signer
- Draw and sign via shared link
- Download signed PDF instantly
<img width="1563" height="791" alt="image" src="https://github.com/user-attachments/assets/316c9960-7495-4691-8002-5df487ad05b4" />

---

## 🏆 Why This Project Stands Out

Most portfolios lack:
- ❌ File workflows
- ❌ Audit trails
- ❌ PDF generation
- ❌ Security-first design
- ❌ Public link sharing

**DotSign has all of them ✅**

This project demonstrates:
- Backend engineering depth (Python + FastAPI)
- Secure file handling (Supabase Storage)
- PDF manipulation (PyMuPDF)
- Audit and compliance logic
- SaaS product thinking
- Full-stack integration

---

## 👤 Author

**Himansu Sekhar Behura**

- GitHub: [@himansu2198](https://github.com/himansu2198)
- LinkedIn: [Himansu Sekhar Behura](https://www.linkedin.com/in/himansu-sekhar-behura-816133256/)

---

## 📄 License

MIT License — free to use for portfolio and learning purposes.

---

> 🖊️ Crafted with ❤️ by **Himansu**
