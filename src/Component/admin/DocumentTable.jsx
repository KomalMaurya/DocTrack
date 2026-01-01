import React, { useState, useEffect } from "react";
import { format, parseISO, differenceInDays, isValid } from "date-fns";
import { Pencil, Trash2,FileText, ExternalLink, Search, Eye, Building, XCircle, Clock4, CheckCircle, AlertCircle } from "lucide-react";

// --- Centralized Status Logic ---
const getDocumentStatus = (expiryDate, currentStatus) => {
  if (currentStatus === 'Under Review') return 'Under Review';
  if (!expiryDate || !isValid(parseISO(expiryDate))) return 'Active';
  
  const today = new Date();
  const expiry = parseISO(expiryDate);
  const daysUntilExpiry = differenceInDays(expiry, today);

  if (daysUntilExpiry < 0) return 'Expired';
  if (daysUntilExpiry <= 30) return 'Expiring Soon';
  return 'Active';
};

const getStatusStyling = (status) => {
  switch (status) {
    case 'Expired':
      return { color: "bg-red-100 text-red-600", border: "border-red-200", icon: XCircle };
    case 'Expiring Soon':
      return { color: "bg-amber-100 text-amber-600", border: "border-amber-200", icon: Clock4 };
    case 'Under Review':
      return { color: "bg-blue-100 text-blue-600", border: "border-blue-200", icon: AlertCircle };
    default:
      return { color: "bg-green-100 text-green-600", border: "border-green-200", icon: CheckCircle };
  }
};

// --- UI Primitives ---
const Button = ({ variant = 'default', size = 'sm', className = '', children, ...props }) => {
  const variants = {
    ghost: "hover:bg-slate-100 text-slate-700",
    outline: "border border-slate-300 bg-transparent hover:bg-slate-100 text-slate-700",
  };
  return <button className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors p-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${className}`}>
    {children}
  </span>
);

const Input = (props) => (
  <input {...props} className={`w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 outline-none ${props.className || ''}`} />
);

const Dialog = ({ open, onOpenChange, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => onOpenChange(false)}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const Label = ({ children, className }) => <label className={`block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 ${className}`}>{children}</label>;

// --- MAIN COMPONENT ---
export default function DocumentTable({ documents = [], isLoading, onEdit, onDelete }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingDocument, setViewingDocument] = useState(null);

  // 1. Extract unique companies from current document list
  const companies = Array.from(new Set(documents.map(doc => doc.company || "Unassigned"))).sort();

  // 2. State for selected company
  const [selectedCompany, setSelectedCompany] = useState("Unassigned");

  // 3. Logic: Update selectedCompany once documents are loaded to ensure visibility
  useEffect(() => {
    if (!isLoading && companies.length > 0) {
      if (selectedCompany === "Unassigned" && !companies.includes("Unassigned")) {
        setSelectedCompany(companies[0]);
      } else if (selectedCompany === "Unassigned" && companies.includes("Unassigned") && companies.length > 1) {
        const firstRealCompany = companies.find(c => c !== "Unassigned");
        setSelectedCompany(firstRealCompany);
      }
    }
  }, [isLoading, documents]);

  // 4. Filter documents based on company AND search query
  const filteredDocuments = documents.filter(doc => {
    const docCompany = doc.company || "Unassigned";
    const matchesCompany = docCompany === selectedCompany;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCompany && matchesSearch;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar - Company Selection */}
      <div className="w-full lg:w-64 flex-shrink-0">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sticky top-24">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 px-2">
            <Building className="w-4 h-4 text-blue-600" /> 
            Companies
          </h3>
          <div className="space-y-1">
            {companies.length === 0 && !isLoading ? (
              <p className="text-xs text-slate-400 px-2">No companies found</p>
            ) : (
              companies.map((company) => (
                <button
                  key={company}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-all
                    ${selectedCompany === company
                      ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"}`}
                  onClick={() => setSelectedCompany(company)}
                >
                  {company}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{selectedCompany}</h2>
              <p className="text-sm text-slate-500">Managing {filteredDocuments.length} documents</p>
            </div>
            <div className="w-full md:w-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search within company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 md:w-64 h-10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Document Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Expiry</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <tr key={i}><td colSpan="5" className="px-6 py-8"><div className="h-10 bg-slate-100 rounded-lg animate-pulse" /></td></tr>
                  ))
                ) : filteredDocuments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <FileText size={40} className="opacity-20" />
                        <p>No documents found for this selection.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDocuments.map((doc) => {
                    const status = getDocumentStatus(doc.expiry_date, doc.status);
                    const style = getStatusStyling(status);
                    
                    // Convert ID to string to prevent substring error
                    const displayId = doc.id ? String(doc.id).substring(0, 8) : "N/A";

                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{doc.name}</p>
                          {/* <p className="text-xs text-slate-400 mt-0.5">ID: {displayId}</p> */}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600 font-medium">{doc.department}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-slate-700">
                            {doc.expiry_date ? format(parseISO(doc.expiry_date), 'MMM dd, yyyy') : 'No Date'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`${style.color} ${style.border}`}>
                            {status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" onClick={() => setViewingDocument(doc)} title="Quick View"><Eye className="w-4 h-4 text-blue-600" /></Button>
                            <Button variant="ghost" onClick={() => onEdit(doc)} title="Edit"><Pencil className="w-4 h-4 text-amber-600" /></Button>
                            <Button variant="ghost" onClick={() => onDelete(doc.id)} title="Delete"><Trash2 className="w-4 h-4 text-red-600" /></Button>
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
      </div>

      {/* View Document Dialog */}
      <Dialog open={!!viewingDocument} onOpenChange={() => setViewingDocument(null)} title={viewingDocument?.name}>
        {viewingDocument && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div><Label>Department</Label><p className="font-bold text-slate-900">{viewingDocument.department}</p></div>
              <div>
                <Label>Status</Label>
                <div>
                  <Badge className={getStatusStyling(getDocumentStatus(viewingDocument.expiry_date, viewingDocument.status)).color}>
                    {getDocumentStatus(viewingDocument.expiry_date, viewingDocument.status)}
                  </Badge>
                </div>
              </div>
              <div><Label>Date of Issue</Label><p className="font-bold text-slate-900">{viewingDocument.date_of_issue ? format(parseISO(viewingDocument.date_of_issue), 'MMMM dd, yyyy') : 'N/A'}</p></div>
              <div><Label>Expiry Date</Label><p className="font-bold text-slate-900 text-red-600">{viewingDocument.expiry_date ? format(parseISO(viewingDocument.expiry_date), 'MMMM dd, yyyy') : 'N/A'}</p></div>
            </div>
            
            {viewingDocument.required_documents && (
              <div>
                <Label>Required Documents</Label>
                <div className="mt-1 p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {viewingDocument.required_documents}
                </div>
              </div>
            )}
            
            {(viewingDocument.application_link || viewingDocument.uploaded_document_url) && (
              <div className="flex flex-col gap-3">
                {viewingDocument.application_link && (
                  <a href={viewingDocument.application_link} target="_blank" rel="noopener noreferrer" 
                     className="flex items-center justify-between p-3 border border-blue-100 bg-blue-50/50 rounded-lg group hover:bg-blue-50 transition-colors">
                    <span className="text-sm font-semibold text-blue-700">Application/Renewal Portal</span>
                    <ExternalLink className="w-4 h-4 text-blue-400 group-hover:text-blue-700" />
                  </a>
                )}
                {viewingDocument.uploaded_document_url && (
                  <a href={viewingDocument.uploaded_document_url} target="_blank" rel="noopener noreferrer" 
                     className="flex items-center justify-between p-3 border border-slate-200 bg-white rounded-lg group hover:bg-slate-50 transition-colors">
                    <span className="text-sm font-semibold text-slate-700">View Stored Document</span>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}