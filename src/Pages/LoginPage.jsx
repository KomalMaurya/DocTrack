import React, { useState } from "react";
import { Shield, LogIn } from "lucide-react";

// --- Reusable UI Primitives ---
const Button = ({ className = '', children, ...props }) => (
  <button className={`inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 transition-colors disabled:opacity-50 bg-blue-700 text-white hover:bg-blue-800 ${className}`} {...props}>{children}</button>
);
const Input = (props) => <input {...props} className={`w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${props.className || ''}`} />;
const Label = (props) => <label {...props} className={`block text-sm font-medium text-slate-700 ${props.className || ''}`} />;

// --- The LoginPage Component ---
export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // --- Mock Authentication ---
    // In a real application, you would make an API call here.
    if (email === "admin@doctrack.com" && password === "admin") {
      onLogin({ name: "Komal Maurya", role: "admin", email: "admin@doctrack.com" });
    } else {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg border border-slate-200">
        <div className="text-center">
            <div className="inline-block p-3 bg-blue-700 rounded-full mb-4">
                <Shield className="w-8 h-8 text-white" />
            </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
          <p className="text-slate-500">Access the Document Management Dashboard</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@doctrack.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin"
            />
          </div>
          
          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}

          <div>
            <Button type="submit" className="w-full gap-2">
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

