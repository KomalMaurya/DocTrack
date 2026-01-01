import React, { useEffect, useState } from "react";
import { Search, FileText, Calendar, AlertCircle, Filter } from "lucide-react";
import { format, differenceInDays, parseISO, isValid } from "date-fns";
import supabase from "../lib/supabase"; // ✅ Default import (make sure supabase.js exports default)

const departments = [
  "Administration",
  "Finance",
  "Legal",
  "Operations",
  "Human Resources",
  "IT",
  "Procurement",
  "Quality Assurance",
];

// Helper to calculate status
const getStatusInfo = (expiryDate) => {
  if (!expiryDate || !isValid(parseISO(expiryDate)))
    return { label: "Invalid Date", color: "bg-gray-200 text-gray-800" };
  const days = differenceInDays(parseISO(expiryDate), new Date());
  if (days < 0) return { label: "Expired", color: "bg-red-100 text-red-800" };
  if (days <= 30)
    return { label: "Expiring Soon", color: "bg-amber-100 text-amber-800" };
  return { label: "Active", color: "bg-green-100 text-green-800" };
};

export default function PublicDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("documents")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setDocuments(data || []);
      } catch (err) {
        console.error("Error fetching documents:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (departmentFilter === "all" || doc.department === departmentFilter)
  );

  return (
    <div className="bg-slate-50 flex-grow">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Approved Documents
              </h1>
              <p className="text-slate-600">
                Public document registry — View approval details
              </p>
            </div>
          </div>
        </header>

        <div className="bg-white p-4 mb-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full h-10 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500 hidden md:block" />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full md:w-48 h-10 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Departments</option>
                {departments.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center bg-white rounded-lg border border-slate-200">
            <p className="text-slate-500 animate-pulse">Loading documents...</p>
          </div>
        ) : filteredDocuments.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => {
              const status = getStatusInfo(doc.expiry_date);
              return (
                <div
                  key={doc.id}
                  className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-lg text-slate-800 pr-2">
                      {doc.name}
                    </h3>
                    {/* <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${status.color}`}
                    >
                      {status.label}
                    </span> */}
                  </div>
                  <p className="text-sm text-slate-500 mb-4">
                    {doc.department}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span>
                        Issue Date:{" "}
                        {doc.date_of_issue
                          ? format(parseISO(doc.date_of_issue), "MMM dd, yyyy")
                          : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span>
                        Expiry Date:{" "}
                        {doc.expiry_date
                          ? format(parseISO(doc.expiry_date), "MMM dd, yyyy")
                          : "—"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-400 text-center">
                      Login as admin to view complete details
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-lg border border-slate-200">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              No documents found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
