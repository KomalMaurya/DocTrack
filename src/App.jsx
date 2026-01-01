import React, { useState, useEffect } from "react";
import { FileText, Shield, LogOut, Home, Loader2, Menu, X, User } from "lucide-react";
// Using @/ alias to ensure paths resolve correctly across the project structure
import PublicDocumentsPage from '@/Pages/PublicDocuments';
import AdminDashboardPage from '@/Pages/AdminDashboard';
import LoginPage from '@/Pages/LoginPage';
import supabase from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Enhanced Button for mobile touch targets
const Button = ({ variant = 'default', size = 'md', className = '', children, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg text-sm font-bold transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50";
  const variants = {
    default: "bg-blue-700 text-white hover:bg-blue-800 shadow-md shadow-blue-100",
    ghost: "hover:bg-blue-50 text-slate-600",
    outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
  };
  const sizes = { 
    sm: "h-9 px-3", 
    md: "h-11 md:h-10 px-4 py-2",
    icon: "h-11 w-11 md:h-10 md:w-10 p-2"
  };
  return <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('public');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // --- CRUD Functions ---
  const handleAddDocument = async (data) => {
    try {
      const newDoc = { ...data, id: uuidv4() }; 
      const { error } = await supabase.from('documents').insert([newDoc]);
      if (error) throw error;
      await fetchDocuments(); 
    } catch (err) {
      console.error('Failed to save document:', err);
    }
  };

  const handleUpdateDocument = async (updatedDoc) => {
    try {
      if (!updatedDoc.id) throw new Error("Missing document id for update");
      const { error } = await supabase.from('documents').update(updatedDoc).eq('id', updatedDoc.id);
      if (error) throw error;
      await fetchDocuments();
    } catch (err) {
      console.error('Failed to update document:', err);
    }
  };

  const handleDeleteDocument = async (id) => {
    try {
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) throw error;
      await fetchDocuments();
    } catch (err) {
      console.error('Failed to delete document:', err);
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
    setIsMobileMenuOpen(false);
  };

  if (isLoggingIn) return <LoginPage onLogin={handleLogin} />;

  const navigateTo = (page) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* --- Responsive Header --- */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Branding */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('public')}>
              <div className="w-10 h-10 bg-blue-800 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-slate-900 leading-tight">Document System</h1>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Official Tracking</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Button 
                      variant={currentPage === 'admin' ? 'default' : 'ghost'} 
                      onClick={() => setCurrentPage('admin')} 
                      className="gap-2"
                    >
                      <FileText className="w-4 h-4" />Admin Dashboard
                    </Button>
                  )}
                  <Button 
                    variant={currentPage === 'public' ? 'default' : 'ghost'} 
                    onClick={() => setCurrentPage('public')} 
                    className="gap-2"
                  >
                    <Home className="w-4 h-4" />Public View
                  </Button>
                  
                  <div className="flex items-center gap-3 ml-2 pl-4 border-l border-slate-200">
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{user.name}</p>
                      <p className="text-[10px] font-bold text-blue-600 uppercase">{user.role}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                      <LogOut className="w-4 h-4" />Logout
                    </Button>
                  </div>
                </>
              ) : (
                <Button onClick={() => setIsLoggingIn(true)}>Admin Login</Button>
              )}
            </nav>

            {/* Mobile Menu Toggle */}
            <div className="flex md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-600"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white animate-in slide-in-from-top-4 duration-300 shadow-xl pb-6">
            <div className="px-4 py-4 space-y-3">
              {user ? (
                <>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-700" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{user.name}</p>
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-tighter">{user.role}</p>
                    </div>
                  </div>
                  
                  {user.role === 'admin' && (
                    <Button 
                      variant={currentPage === 'admin' ? 'default' : 'outline'} 
                      className="w-full gap-3 justify-start"
                      onClick={() => navigateTo('admin')}
                    >
                      <FileText size={18} /> Admin Dashboard
                    </Button>
                  )}
                  
                  <Button 
                    variant={currentPage === 'public' ? 'default' : 'outline'} 
                    className="w-full gap-3 justify-start"
                    onClick={() => navigateTo('public')}
                  >
                    <Home size={18} /> Public View
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full gap-3 justify-start text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut size={18} /> Sign Out
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsLoggingIn(true)} className="w-full h-12">
                  Admin Login
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* --- Main Content --- */}
      <main className="flex-grow flex flex-col">
        {error && (
          <div className="p-4 m-4 rounded-lg flex items-center gap-3 text-red-600 bg-red-50 border border-red-100 animate-in fade-in duration-500">
            <X size={18} />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex-grow flex flex-col justify-center items-center p-8 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-700" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Registry</p>
          </div>
        ) : (
          <div className="animate-in fade-in duration-700 flex-grow flex flex-col">
            {currentPage === 'admin' && user?.role === 'admin' ? (
              <AdminDashboardPage
                documents={documents}
                onAdd={handleAddDocument}
                onUpdate={handleUpdateDocument}
                onDelete={handleDeleteDocument}
              />
            ) : (
              <PublicDocumentsPage documents={documents} />
            )}
          </div>
        )}
      </main>

      {/* Simplified Mobile Footer */}
      <footer className="bg-slate-900 py-6 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <p className="text-xs font-medium text-slate-500">
            © 2025 Document Approval System. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
             <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">System Version 1.0.4</span>
          </div>
        </div>
      </footer>
    </div>
  );
}