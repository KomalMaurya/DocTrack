import React, { useState, useEffect } from "react";
import { Plus, Shield, X, LayoutDashboard, MailWarning } from "lucide-react";
import StatsOverview from "../Component/admin/StatsOverview";
import DocumentForm from "../Component/admin/DocumentForm";
import DocumentTable from "../Component/admin/DocumentTable";
import ReminderPanel from "../Component/admin/ReminderPanel";
import supabase from "../lib/supabase";

const Button = ({ variant = "default", className = "", children, ...props }) => {
  const base = "inline-flex items-center justify-center rounded-lg text-sm font-bold h-11 md:h-10 px-4 py-2 transition-all active:scale-95 disabled:opacity-50";
  const variantStyles = {
    default: "bg-blue-700 text-white hover:bg-blue-800 shadow-md shadow-blue-100",
    outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
  };
  return (
    <button className={`${base} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default function AdminDashboardPage() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("documents");

  // Selection state for current company view
  const [selectedCompany, setSelectedCompany] = useState(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const docs = data || [];
      setDocuments(docs);

      // Auto-select first company if none selected
      if (docs.length > 0 && !selectedCompany) {
        const uniqueCompanies = Array.from(new Set(docs.map(d => d.company || "Unassigned")));
        setSelectedCompany(uniqueCompanies[0]);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleAddDocument = async (docData) => {
    setIsProcessing(true);
    try {
      // Ensure the document is assigned to the currently viewed company
      const newDoc = { ...docData, company: selectedCompany || docData.company || "Unassigned" };
      delete newDoc.id;

      const { error } = await supabase.from("documents").insert([newDoc]);
      if (error) throw error;
      
      await fetchDocuments();
      setShowForm(false);
    } catch (err) {
      console.error("Failed to add document:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateDocument = async (updatedDoc) => {
    setIsProcessing(true);
    try {
      const { id, ...fieldsToUpdate } = updatedDoc;
      const { error } = await supabase.from("documents").update(fieldsToUpdate).eq("id", id);
      if (error) throw error;

      setDocuments(prev =>
        prev.map(doc => (doc.id === id ? { ...doc, ...fieldsToUpdate } : doc))
      );

      setShowForm(false);
      setEditingDocument(null);
    } catch (err) {
      console.error("Failed to update document:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      const { error } = await supabase.from("documents").delete().eq("id", id);
      if (error) throw error;
      await fetchDocuments();
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  };

  const handleEdit = (doc) => {
    setEditingDocument(doc);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddNew = () => {
    setEditingDocument(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingDocument(null);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== "documents") {
      setShowForm(false);
      setEditingDocument(null);
    }
  };

  return (
    <div className="py-6 md:py-8 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen flex flex-col">
      <div className="max-w-7xl mx-auto w-full">
        {/* --- Responsive Header --- */}
        <header className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">Admin Dashboard</h1>
              <p className="text-xs md:text-sm text-slate-500 font-medium">Compliance & Registry Control</p>
            </div>
          </div>
          
          {activeTab === "documents" && (
            <Button 
              onClick={showForm ? handleCancelForm : handleAddNew} 
              className={`w-full sm:w-auto gap-2 ${showForm ? 'bg-slate-800' : ''}`}
            >
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? "Cancel Entry" : "Add Document"}
            </Button>
          )}
        </header>

        {/* Stats Grid - Internal responsiveness handled by component */}
        <StatsOverview documents={documents} selectedCompany={selectedCompany} />

        {/* --- Custom Styled Tabs --- */}
        <div className="mt-8 space-y-6">
          <div className="bg-white p-1 rounded-xl border border-slate-200 inline-flex w-full sm:w-auto shadow-sm">
            <button
              onClick={() => handleTabChange("documents")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === "documents"
                  ? "bg-blue-700 text-white shadow-md"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Documents
            </button>
            <button
              onClick={() => handleTabChange("reminders")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === "reminders"
                  ? "bg-blue-700 text-white shadow-md"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <MailWarning className="w-4 h-4" />
              Reminders
            </button>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {activeTab === "documents" && (
              showForm ? (
                <DocumentForm
                  document={editingDocument}
                  onSubmit={editingDocument ? handleUpdateDocument : handleAddDocument}
                  onCancel={handleCancelForm}
                  isProcessing={isProcessing}
                  selectedCompany={selectedCompany}
                />
              ) : (
                <DocumentTable
                  documents={documents}
                  isLoading={isLoading}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  selectedCompany={selectedCompany}
                  setSelectedCompany={setSelectedCompany}
                />
              )
            )}
            
            {activeTab === "reminders" && (
              <ReminderPanel 
                documents={documents} 
                isLoading={isLoading} 
                onUpdateDocument={handleUpdateDocument} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}