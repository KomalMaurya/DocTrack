import React, { useState, useEffect } from "react";
import { FileText, Shield, LogOut, Home, Loader2 } from "lucide-react";
import PublicDocumentsPage from './Pages/PublicDocuments';
import AdminDashboardPage from './Pages/AdminDashboard';
import LoginPage from './Pages/LoginPage';
import supabase from './lib/supabase';
import { v4 as uuidv4 } from 'uuid';

const Button = ({ variant = 'default', size = 'md', className = '', children, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50";
  const variants = {
    default: "bg-blue-700 text-white hover:bg-blue-800",
    ghost: "hover:bg-blue-100 text-slate-700",
  };
  const sizes = { sm: "h-9 px-3", md: "h-10 py-2 px-4" };
  return <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('public');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore user from localStorage on load
  useEffect(() => {
    const savedUser = localStorage.getItem("adminUser");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      if (parsedUser.role === "admin") setCurrentPage("admin");
    }
  }, []);

  // Fetch documents from Supabase
  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to load documents.');
    } else {
      setDocuments(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // --- CRUD Functions ---

  // Add a new document (let database generate id)
  // --- Add a new document ---
const handleAddDocument = async (data) => {
  try {
    // ✅ Generate a unique ID for the new document
    const newDoc = { ...data, id: uuidv4() }; 

    const { error } = await supabase.from('documents').insert([newDoc]);
    if (error) throw error;

    await fetchDocuments(); // Refresh the list
  } catch (err) {
    console.error('Failed to save document:', err);
    alert("Failed to save document. Check console for details.");
  }
};


  // Update an existing document
  const handleUpdateDocument = async (updatedDoc) => {
    try {
      if (!updatedDoc.id) throw new Error("Missing document id for update");
      const { error } = await supabase.from('documents').update(updatedDoc).eq('id', updatedDoc.id);
      if (error) throw error;
      await fetchDocuments();
    } catch (err) {
      console.error('Failed to update document:', err);
      alert("Failed to update document. Check console for details.");
    }
  };

  // Delete a document
  const handleDeleteDocument = async (id) => {
    try {
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) throw error;
      await fetchDocuments();
    } catch (err) {
      console.error('Failed to delete document:', err);
      alert("Failed to delete document. Check console for details.");
    }
  };

  // --- Authentication Handlers ---
  const handleLogin = (userData) => {
    localStorage.setItem("adminUser", JSON.stringify(userData));
    setUser(userData);
    if (userData.role === "admin") setCurrentPage("admin");
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    setUser(null);
    setCurrentPage("public");
  };

  // Render login page if logging in
  if (isLoggingIn) return <LoginPage onLogin={handleLogin} />;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-800 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">Document Approval System</h1>
                <p className="text-xs text-slate-500">Official Document Tracking</p>
              </div>
            </div>
            <nav className="flex items-center gap-4">
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Button variant={currentPage === 'admin' ? 'default' : 'ghost'} onClick={() => setCurrentPage('admin')} className="gap-2">
                      <FileText className="w-4 h-4" />Admin Dashboard
                    </Button>
                  )}
                  {currentPage !== 'public' && (
                    <Button variant="ghost" onClick={() => setCurrentPage('public')} className="gap-2">
                      <Home className="w-4 h-4" />Public View
                    </Button>
                  )}
                  <div className="flex items-center gap-3 ml-2 pl-4 border-l border-slate-200">
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                      <LogOut className="w-4 h-4" />Logout
                    </Button>
                  </div>
                </>
              ) : (
                <Button onClick={() => setIsLoggingIn(true)}>Admin Login</Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {error && <div className="p-4 text-center text-red-600 bg-red-50">{error}</div>}
        {isLoading && (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
          </div>
        )}

        {!isLoading && !error && (
          currentPage === 'admin' && user?.role === 'admin' ? (
            <AdminDashboardPage
              documents={documents}
              onAdd={handleAddDocument}
              onUpdate={handleUpdateDocument}
              onDelete={handleDeleteDocument}
            />
          ) : (
            <PublicDocumentsPage documents={documents} />
          )
        )}
      </main>
    </div>
  );
}
