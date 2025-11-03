import React, { useState } from "react";
import { format, parseISO } from "date-fns";
import { Pencil, Trash2, ExternalLink, Search, Eye, Building } from "lucide-react";

const Button = ({ variant = 'default', size = 'sm', className = '', children, ...props }) => {
  const variants = {
    ghost: "hover:bg-slate-100 text-slate-700",
  };
  return <button className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors p-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${className}`}>
    {children}
  </span>
);

const Input = (props) => (
  <input {...props} className={`w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${props.className || ''}`} />
);

const Dialog = ({ open, onOpenChange, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => onOpenChange(false)}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const Label = ({ children, className }) => <label className={`block text-sm font-medium text-slate-500 ${className}`}>{children}</label>;

const getStatusInfo = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
      return { label: "Active", color: "text-green-700 bg-green-100" };
    case "expired":
      return { label: "Expired", color: "text-red-700 bg-red-100" };
    case "pending":
      return { label: "Pending", color: "text-amber-700 bg-amber-100" };
    default:
      return { label: "Unknown", color: "text-gray-700 bg-gray-100" };
  }
};

// --- MAIN COMPONENT ---
export default function DocumentTable({ documents, isLoading, onEdit, onDelete }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingDocument, setViewingDocument] = useState(null);

  // 🏢 Extract unique company names
  const companies = Array.from(new Set(documents.map(doc => doc.company_name || "Unassigned")));

  // 📂 Track selected company
  const [selectedCompany, setSelectedCompany] = useState(companies[0] || "Unassigned");

  // 🔍 Filter documents
  const filteredDocuments = documents.filter(
    doc =>
      (doc.company_name || "Unassigned") === selectedCompany &&
      (doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="w-60 bg-slate-50 border border-slate-200 rounded-lg shadow-sm p-4">
        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Building className="w-4 h-4 text-slate-500" /> Companies
        </h3>
        <div className="space-y-2">
          {companies.map((company) => (
            <button
              key={company}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${selectedCompany === company
                  ? "bg-blue-100 text-blue-700 border border-blue-300"
                  : "hover:bg-slate-100 text-slate-700"}`}
              onClick={() => setSelectedCompany(company)}
            >
              {company}
            </button>
          ))}
        </div>
      </div>

      {/* Document Table Section */}
      <div className="flex-1 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-slate-900">{selectedCompany} Documents</h2>
          <div className="w-full md:w-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 md:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Document Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dates</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {isLoading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i}>
                      <td colSpan="5" className="p-4">
                        <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
                      </td>
                    </tr>
                  ))
              ) : filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-slate-500 py-6">
                    No documents found for {selectedCompany}.
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => {
                  const statusInfo = getStatusInfo(doc.status);
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{doc.name}</td>
                      <td className="px-4 py-3 text-slate-600">{doc.department}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <div><span className="font-medium">Issued:</span> {format(parseISO(doc.date_of_issue), 'MMM dd, yyyy')}</div>
                        <div><span className="font-medium">Expires:</span> {format(parseISO(doc.expiry_date), 'MMM dd, yyyy')}</div>
                      </td>
                      <td className="px-4 py-3"><Badge className={statusInfo.color}>{statusInfo.label}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" onClick={() => setViewingDocument(doc)}><Eye className="w-4 h-4 text-blue-600" /></Button>
                          <Button variant="ghost" onClick={() => onEdit(doc)}><Pencil className="w-4 h-4 text-amber-600" /></Button>
                          <Button variant="ghost" onClick={() => onDelete(doc.id)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Document Dialog */}
      <Dialog open={!!viewingDocument} onOpenChange={() => setViewingDocument(null)} title={viewingDocument?.name}>
        {viewingDocument && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>Department</Label><p className="font-medium">{viewingDocument.department}</p></div>
              <div><Label>Status</Label><Badge className={getStatusInfo(viewingDocument.status).color}>{getStatusInfo(viewingDocument.status).label}</Badge></div>
              <div><Label>Date of Issue</Label><p className="font-medium">{format(parseISO(viewingDocument.date_of_issue), 'MMMM dd, yyyy')}</p></div>
              <div><Label>Expiry Date</Label><p className="font-medium">{format(parseISO(viewingDocument.expiry_date), 'MMMM dd, yyyy')}</p></div>
            </div>
            {viewingDocument.required_documents && (<div><Label>Required Documents</Label><p className="mt-1 text-slate-700 whitespace-pre-wrap">{viewingDocument.required_documents}</p></div>)}
            {viewingDocument.process_description && (<div><Label>Process Description</Label><p className="mt-1 text-slate-700 whitespace-pre-wrap">{viewingDocument.process_description}</p></div>)}
            {viewingDocument.application_link && (<div><Label>Application Link</Label><a href={viewingDocument.application_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline mt-1">{viewingDocument.application_link}<ExternalLink className="w-4 h-4"/></a></div>)}
            {viewingDocument.uploaded_document_url && (<div><Label>Uploaded Document</Label><a href={viewingDocument.uploaded_document_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline mt-1">View Document<ExternalLink className="w-4 h-4"/></a></div>)}
          </div>
        )}
      </Dialog>
    </div>
  );
}
