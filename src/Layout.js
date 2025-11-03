import React, { useState, useEffect } from "react";
import { FileText, Shield, LogOut, Menu, X, Home } from "lucide-react";

// ----- Recreated UI Component -----
// A simple Button component to replace the one from "@/components/ui/button"
const Button = ({ variant = 'default', size = 'md', className = '', children, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  
  const variants = {
    default: "bg-blue-700 text-white hover:bg-blue-800",
    ghost: "hover:bg-slate-100 hover:text-slate-900",
    outline: "border border-slate-200 bg-transparent hover:bg-slate-100 hover:text-slate-900",
  };

  const sizes = {
    sm: "h-9 px-3",
    md: "h-10 py-2 px-4",
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};


// ----- Main Layout Component -----
const Layout = ({ children, currentPage, onNavigate, user, onLogin, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = user?.role === 'admin';

  const NavLink = ({ page, icon, children }) => (
    <Button 
      variant={currentPage === page ? "default" : "ghost"}
      onClick={() => {
        onNavigate(page);
        setMobileMenuOpen(false);
      }}
      className="gap-2 w-full justify-start md:w-auto"
    >
      {icon}
      {children}
    </Button>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('public')}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-700 to-blue-900 rounded-lg flex items-center justify-center shadow-md">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">DocTrack</h1>
                <p className="text-xs text-slate-500">Official Document Tracking</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <NavLink page="public" icon={<Home className="w-4 h-4" />}>Public View</NavLink>
              {isAdmin && (
                <NavLink page="admin" icon={<FileText className="w-4 h-4" />}>Admin Dashboard</NavLink>
              )}

              {user ? (
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-200">
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">{user.full_name}</p>
                    <p className="text-xs text-slate-500">{isAdmin ? 'Administrator' : 'User'}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={onLogout} className="gap-2">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button onClick={onLogin} className="ml-4">Admin Login</Button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200">
              <div className="flex flex-col gap-2">
                <NavLink page="public" icon={<Home className="w-4 h-4" />}>Public View</NavLink>
                {isAdmin && (
                  <NavLink page="admin" icon={<FileText className="w-4 h-4" />}>Admin Dashboard</NavLink>
                )}

                {user ? (
                  <div className="pt-4 mt-4 border-t border-slate-200">
                    <p className="px-4 text-sm font-medium text-slate-900 mb-2">{user.full_name}</p>
                    <Button variant="outline" className="w-full gap-2" onClick={onLogout}>
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button onClick={onLogin} className="w-full mt-4">Admin Login</Button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-10.5rem)]"> {/* Adjusted min-height for footer */}
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-slate-400">
            © 2025 Document Approval System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};


// ----- App Component to Demonstrate Layout -----
// This App component shows how to use the Layout and simulates page changes.
export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('public'); // 'public' or 'admin'

  // Simulate initial user fetch
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      // Set to null to see the logged-out state initially
      setUser(null); 
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Mock login/logout functions
  const handleLogin = () => {
      // You can change the role to 'user' to see the non-admin view
      setUser({ full_name: 'Komal Maurya', role: 'admin' });
      setCurrentPage('admin'); // Navigate to admin page on login
  };
  const handleLogout = () => setUser(null);

  // Simple placeholder pages
  const PublicPage = () => (
      <div className="p-8">
          <h1 className="text-2xl font-bold">Public Documents Page</h1>
          <p>This is where the public document listing would go.</p>
      </div>
  );
  const AdminPage = () => (
      <div className="p-8">
          <h1 className="text-2xl font-bold">Admin Dashboard Page</h1>
          <p>This is where the admin dashboard content would go.</p>
      </div>
  );

  if (isLoading) {
      return (
          <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
      );
  }

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      user={user}
      onLogin={handleLogin}
      onLogout={handleLogout}
    >
      {/* This is where the actual page content is rendered */}
      {currentPage === 'admin' ? <AdminPage /> : <PublicPage />}
    </Layout>
  );
}
