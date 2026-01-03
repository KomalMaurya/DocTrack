DocTrack - Document Approval System

DocTrack is a professional, mobile-responsive web application designed to track, manage, and monitor official document approvals. It features a public registry for transparency and an administrative console for robust lifecycle management of documents, including automated status tracking and stakeholder notifications.

🚀 Features

Public Registry

Document Lookup: Search and filter through approved documents by name or department.

Detailed View: Access comprehensive document information, including process descriptions and required prerequisites.

Expiry Monitoring: Visual badges indicating document status (Active, Expiring Soon, Expired).

Administrative Console

Role-Based Access: Secure login system with administrative privileges required for data modification.

Full CRUD Management: Create, Read, Update, and Delete document records seamlessly.

Company Categorization: Group documents by company (e.g., Felix, Barmalt) for organized management.

Automated Sync: The system automatically updates document status labels in the database based on real-time date calculations.

Document Storage: Integration for linking official document URLs and application portals.

Mobile Optimization

Responsive Design: Fully optimized for mobile, tablet, and desktop views.

Touch-Friendly UI: Large touch targets, segmented controls, and card-based layouts for mobile users.

Adaptive Navigation: Hamburger menu and horizontal scrolling sidebars to maximize screen real estate.

🛠 Tech Stack

Frontend: React 18 (Vite)

Styling: Tailwind CSS, Lucide React (Icons)

Backend/Database: Supabase (PostgreSQL + PostgREST)

State Management: React Hooks (useState, useEffect)

Utilities: date-fns (Date handling), uuid (ID generation)

📦 Installation & Setup

Prerequisites

Node.js (v18 or higher)

A Supabase project

Steps

Clone the repository

git clone <your-repo-url>
cd DocTrack


Install dependencies

npm install


Environment Configuration
Create a .env file in the root directory and add your Supabase credentials:

VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key


Database Schema
Run the following SQL in your Supabase SQL Editor to set up the documents table:

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  name TEXT NOT NULL,
  company TEXT,
  department TEXT NOT NULL,
  date_of_issue DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status TEXT DEFAULT 'Active',
  required_documents TEXT,
  process_description TEXT,
  application_link TEXT,
  uploaded_document_url TEXT,
  stakeholder_emails TEXT
);


Start Development Server

npm run dev


📂 Project Structure

src/
├── api/              # API clients and base configurations
├── Component/        # Shared UI components
│   └── admin/        # Dashboard, Forms, Tables, and Panels
├── lib/              # Library initializations (Supabase, etc.)
├── Pages/            # Main view containers (Public, Admin, Login)
├── App.jsx           # Main application shell and routing logic
└── main.jsx          # Entry point and global style imports


🛡 Security

Admin routes are guarded by a local session check.

Administrative operations (Add/Edit/Delete) are protected via Supabase Row Level Security (RLS) policies based on the user's role.

© 2025 Document Approval System. Built for professional compliance tracking.
