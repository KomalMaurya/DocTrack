import React, { useState, useEffect } from "react";
import { Search, FileText, Calendar, AlertCircle, Filter, X, Link as LinkIcon, FileCheck, Users, Mail } from "lucide-react";
import { format, differenceInDays, parseISO, isValid } from "date-fns";

// --- Mock Data updated with the new schema ---
const initialMockDocuments = [
  {
    id: 'doc1',
    name: 'Q4 Financial Report and Projections',
    department: 'Finance',
    date_of_issue: '2025-07-23',
    expiry_date: '2026-05-09',
    required_documents: 'Previous quarter reports, Sales data spreadsheet, Expense receipts.',
    process_description: 'Submit all required documents to the finance head. The review process takes 5 business days. An approval email will be sent upon completion.',
    application_link: 'https://example.com/finance-portal/q4-report',
    uploaded_document_url: 'https://example.com/docs/q4-report-final.pdf',
    status: 'Active',
    stakeholder_emails: 'head.finance@example.com, ceo@example.com',
    last_reminder_sent: null,
  },
  {
    id: 'doc2',
    name: 'New Employee Onboarding Handbook',
    department: 'Human Resources',
    date_of_issue: '2025-04-24',
    expiry_date: '2026-04-19',
    required_documents: 'Signed employment contract, NDA agreement, Tax forms.',
    process_description: 'The HR department prepares the handbook. New hires must read and sign the acknowledgment form within their first week.',
    application_link: null,
    uploaded_document_url: 'https://example.com/docs/employee-handbook-v3.pdf',
    status: 'Active',
    stakeholder_emails: 'hr.manager@example.com',
    last_reminder_sent: null,
  },
  {
    id: 'doc3',
    name: 'Service Level Agreement (SLA) with CloudProvider Inc.',
    department: 'IT',
    date_of_issue: '2025-09-21',
    expiry_date: '2025-11-15', // This will be "Expiring Soon"
    required_documents: 'Initial service proposal, Security compliance checklist.',
    process_description: 'The IT and Legal departments review the SLA annually. Any amendments must be approved by the CTO. Renewal process should begin 60 days before expiry.',
    application_link: 'https://cloudprovider.com/sla-portal',
    uploaded_document_url: 'https://example.com/docs/sla-cloudprovider.pdf',
    status: 'Expiring Soon',
    stakeholder_emails: 'cto@example.com, legal.dept@example.com, it.ops@example.com',
    last_reminder_sent: '2025-10-15',
  },
  {
    id: 'doc4',
    name: 'Office Lease Agreement - Downtown Branch',
    department: 'Legal',
    date_of_issue: '2022-10-01',
    expiry_date: '2024-09-30', // This will be "Expired"
    required_documents: 'Building permits, Certificate of occupancy, Insurance documents.',
    process_description: 'The lease agreement is reviewed by the legal team and signed by the COO. Notice of renewal or termination must be provided 6 months prior to the expiry date.',
    application_link: null,
    uploaded_document_url: 'https://example.com/docs/lease-downtown.pdf',
    status: 'Expired',
    stakeholder_emails: 'coo@example.com, legal.head@example.com',
    last_reminder_sent: '2024-03-01',
  },
];


// --- Helper Functions & Components ---

const getStatusInfo = (expiryDate) => {
  if (!expiryDate || !isValid(parseISO(expiryDate))) {
      return { label: 'Invalid Date', color: 'bg-gray-100 text-gray-800 border-gray-200' };
  }
  const today = new Date();
  const expiry = parseISO(expiryDate);
  const daysUntilExpiry = differenceInDays(expiry, today);

  if (daysUntilExpiry < 0) {
    return { label: 'Expired', color: 'bg-red-100 text-red-800 border-red-200' };
  } else if (daysUntilExpiry <= 30) {
    return { label: 'Expiring Soon', color: 'bg-amber-100 text-amber-800 border-amber-200' };
  } else {
    return { label: 'Active', color: 'bg-green-100 text-green-800 border-green-200' };
  }
};

const DetailItem = ({ icon, label, children }) => (
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0 w-6 h-6 text-slate-500">{icon}</div>
    <div className="flex-1">
      <p className="font-semibold text-slate-800">{label}</p>
      <div className="text-slate-600 text-sm">{children}</div>
    </div>
  </div>
);

// --- Modal Component for Document Details ---
const DocumentDetailModal = ({ doc, onClose }) => {
  if (!doc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900">{doc.name}</h2>
            <p className="text-slate-500">{doc.department}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 sm:p-8 space-y-8">
          <DetailItem icon={<FileCheck size={24}/>} label="Process Description">
            <p>{doc.process_description}</p>
          </DetailItem>
          <DetailItem icon={<FileText size={24}/>} label="Required Documents">
            <p>{doc.required_documents}</p>
          </DetailItem>
          <DetailItem icon={<Users size={24}/>} label="Stakeholders">
             <p className="break-all">{doc.stakeholder_emails}</p>
          </DetailItem>

          {doc.application_link && (
            <DetailItem icon={<LinkIcon size={24}/>} label="Application Link">
              <a href={doc.application_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                {doc.application_link}
              </a>
            </DetailItem>
          )}

          {doc.uploaded_document_url && (
            <DetailItem icon={<Mail size={24}/>} label="Uploaded Document">
              <a href={doc.uploaded_document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                View Document
              </a>
            </DetailItem>
          )}
        </div>
      </div>
    </div>
  );
};


// --- Main PublicDocuments Component ---
export default function PublicDocuments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setDocuments(initialMockDocuments);
      setIsLoading(false);
    }, 1000); // Simulate API loading
  }, []);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || doc.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });
  
  const departments = [...new Set(initialMockDocuments.map(d => d.department))].sort();

  return (
    <>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Approved Documents</h1>
                <p className="text-slate-600">Public document registry - Click on a card to view details</p>
              </div>
            </div>
          </header>

          <div className="bg-white p-6 mb-6 rounded-xl border border-slate-200 shadow-sm">
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
                <Filter className="w-4 h-4 text-slate-500" />
                <select 
                  value={departmentFilter} 
                  onChange={e => setDepartmentFilter(e.target.value)}
                  className="w-48 h-10 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                </select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-6 bg-white rounded-xl border border-slate-200">
                  <div className="h-6 w-3/4 mb-4 bg-slate-200 rounded animate-pulse" />
                  <div className="h-4 w-1/2 mb-2 bg-slate-200 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-slate-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No documents found</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((doc) => {
                const statusInfo = getStatusInfo(doc.expiry_date);
                return (
                  <div 
                    key={doc.id} 
                    className="p-6 hover:shadow-lg transition-shadow duration-300 bg-white border border-slate-200 rounded-xl cursor-pointer"
                    onClick={() => setSelectedDoc(doc)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 pr-2">
                        <h3 className="font-semibold text-lg text-slate-900 mb-2 line-clamp-2">{doc.name}</h3>
                        <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded-full">{doc.department}</span>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${statusInfo.color}`}>{statusInfo.label}</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-slate-600">Issued:</span>
                        <span className="font-medium text-slate-900">{format(parseISO(doc.date_of_issue), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-red-600" />
                        <span className="text-slate-600">Expires:</span>
                        <span className="font-medium text-slate-900">{format(parseISO(doc.expiry_date), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-500 text-center">Login as admin to view complete details</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <DocumentDetailModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
    </>
  );
}

