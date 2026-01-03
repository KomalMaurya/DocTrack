# 📄 DocTrack – Document Approval System

DocTrack is a professional, mobile-responsive web application designed to track, manage, and monitor official document approvals. It provides a public registry for transparency and a secure administrative console for complete document lifecycle management.

🔗 **Live Demo:**  
https://doc-track-mauve.vercel.app/

---

## 🚀 Features

### 🌐 Public Registry
- Document lookup with search and filter by name or department
- Detailed document view with process description and required prerequisites
- Expiry monitoring with visual status badges:
  - 🟢 Active
  - 🟡 Expiring Soon
  - 🔴 Expired

---

### 🔐 Administrative Console
- Role-based access control with secure login
- Full CRUD operations (Create, Read, Update, Delete)
- Company-wise document categorization (e.g., Felix, Barmalt)
- Automated document status updates based on expiry dates
- Support for official document URLs and application portals
- Stakeholder email tracking

---

### 📱 Mobile Optimization
- Fully responsive design for mobile, tablet, and desktop
- Touch-friendly UI with card-based layouts
- Adaptive navigation with hamburger menu and scrollable sidebars

---

## 🛠 Tech Stack

- **Frontend:** React 18 (Vite)
- **Styling:** Tailwind CSS, Lucide React
- **Backend / Database:** Supabase (PostgreSQL + PostgREST)
- **State Management:** React Hooks (`useState`, `useEffect`)
- **Utilities:** date-fns, uuid
- **Deployment:** Vercel

---

## 📦 Installation & Setup

### Prerequisites
- Node.js v18 or higher
- Supabase project

---

### Setup Steps

#### 1. Clone the repository
```bash
git clone https://github.com/KomalMaurya/DocTrack.git
cd DocTrack
