import React, { useState, useEffect } from "react";
import { Plus, Shield, X } from "lucide-react";
import StatsOverview from "../Component/admin/StatsOverview";
import DocumentForm from "../Component/admin/DocumentForm";
import DocumentTable from "../Component/admin/DocumentTable";
import ReminderPanel from "../Component/admin/ReminderPanel";
import supabase from "../lib/supabase";

const Button = ({ variant = "default", className = "", children, ...props }) => {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 transition-colors disabled:opacity-50";
  const variantStyles = {
    default: "bg-blue-700 text-white hover:bg-blue-800",
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

  // ✅ for sidebar company selection
  const [selectedCompany, setSelectedCompany] = useState(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching documents:", error);
      setDocuments([]);
    } else {
      setDocuments(data);
      if (data.length > 0 && !selectedCompany) {
        const firstCompany = data[0].company_name || "Unassigned";
        setSelectedCompany(firstCompany);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleAddDocument = async (docData) => {
    setIsProcessing(true);
    try {
      const newDoc = { ...docData, company_name: selectedCompany };
      delete newDoc.id;
      const { error } = await supabase.from("documents").insert([newDoc]);
      if (error) throw error;
      await fetchDocuments();
      setShowForm(false);
    } catch (err) {
      console.error("Failed to add document:", err);
      alert("Error adding document. Check console for details.");
    }
    setIsProcessing(false);
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
      alert("Failed to update document. Check console for details.");
    }
    setIsProcessing(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      const { error } = await supabase.from("documents").delete().eq("id", id);
      if (error) throw error;
      await fetchDocuments();
    } catch (err) {
      console.error("Failed to delete document:", err);
      alert("Failed to delete document. Check console for details.");
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
    <div className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-50 flex-grow">
      <div className="max-w-7xl mx-auto">
        {/* --- Header --- */}
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-500">Manage company documents and reminders</p>
            </div>
          </div>
          {activeTab === "documents" && (
            <Button onClick={showForm ? handleCancelForm : handleAddNew} className="gap-2">
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? "Cancel Form" : "Add New Document"}
            </Button>
          )}
        </header>

        <StatsOverview documents={documents} selectedCompany={selectedCompany} />

        {/* --- Tabs --- */}
        <div className="space-y-6">
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              <button
                onClick={() => handleTabChange("documents")}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "documents"
                    ? "border-blue-700 text-blue-700"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                Documents
              </button>
              <button
                onClick={() => handleTabChange("reminders")}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "reminders"
                    ? "border-blue-700 text-blue-700"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                Email Reminders
              </button>
            </nav>
          </div>

          <div>
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
              <ReminderPanel documents={documents} isLoading={isLoading} onUpdateDocument={handleUpdateDocument} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
