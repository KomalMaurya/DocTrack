import React, { useState, useEffect, useRef } from "react";
import { FileText, Upload, X, Loader2 } from "lucide-react";

// --- Reusable UI Primitives ---
const Button = ({ variant = 'default', className = '', children, ...props }) => {
  const variants = {
    default: "bg-blue-700 text-white hover:bg-blue-800",
    outline: "border border-slate-300 bg-transparent hover:bg-slate-100 text-slate-700",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700"
  };
  return <button className={`inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 transition-colors disabled:opacity-50 ${variants[variant]} ${className}`} {...props}>{children}</button>;
};
const Input = (props) => <input {...props} className={`w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${props.className || ''}`} />;
const Textarea = (props) => <textarea {...props} className={`w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${props.className || ''}`} />;
const Select = ({ children, ...props }) => <select {...props} className={`w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white ${props.className || ''}`}>{children}</select>;
const Label = (props) => <label {...props} className={`block text-sm font-medium text-slate-700 mb-1 ${props.className || ''}`} />;

// --- Static Options ---
const companies = ["Felix","Barmalt"];
const departments = ["Finance", "Human Resources", "Legal", "Operations", "IT", "Administration", "Procurement", "Quality Assurance"];

// --- DocumentForm Component ---
export default function DocumentForm({ document, onSubmit, onCancel, isProcessing }) {
  const [formData, setFormData] = useState({
    name: "", company: "", department: "", date_of_issue: "", expiry_date: "",
    required_documents: "", process_description: "", application_link: "", uploaded_document_url: "",
    status: "Active", stakeholder_emails: ""
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Prefill form if editing a document
  useEffect(() => {
    if (document) {
      setFormData({ ...document, date_of_issue: document.date_of_issue || '', expiry_date: document.expiry_date || '' });
    } else {
      setFormData({
        name: "", company: "", department: "", date_of_issue: "", expiry_date: "",
        required_documents: "", process_description: "", application_link: "", uploaded_document_url: "",
        status: "Active", stakeholder_emails: ""
      });
    }
  }, [document]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    // Simulate file upload (replace this with Supabase Storage later)
    setTimeout(() => {
      setFormData(prev => ({ ...prev, uploaded_document_url: `/${file.name}` }));
      setUploading(false);
    }, 1500);
  };

  const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => { e.preventDefault(); onSubmit(formData); };

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm mb-8">
      <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-700" />
        {document ? 'Edit Document' : 'Add New Document'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <Label htmlFor="name">Document Name *</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g., Business License" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="company">Company *</Label>
            <Select id="company" name="company" value={formData.company} onChange={handleChange} required>
              <option value="" disabled>Select Company</option>
              {companies.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="department">Department *</Label>
            <Select id="department" name="department" value={formData.department} onChange={handleChange} required>
              <option value="" disabled>Select Department</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="date_of_issue">Date of Issue *</Label>
            <Input id="date_of_issue" name="date_of_issue" type="date" value={formData.date_of_issue} onChange={handleChange} required />
          </div>

          <div className="space-y-1">
            <Label htmlFor="expiry_date">Expiry Date *</Label>
            <Input id="expiry_date" name="expiry_date" type="date" value={formData.expiry_date} onChange={handleChange} required />
          </div>

          <div className="space-y-1">
            <Label htmlFor="status">Status</Label>
            <Select id="status" name="status" value={formData.status} onChange={handleChange}>
              <option>Active</option>
              <option>Expiring Soon</option>
              <option>Expired</option>
              <option>Under Review</option>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="application_link">Application Link</Label>
            <Input id="application_link" name="application_link" type="url" value={formData.application_link} onChange={handleChange} placeholder="https://" />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="stakeholder_emails">Stakeholder Email Addresses</Label>
          <Input id="stakeholder_emails" name="stakeholder_emails" type="text" value={formData.stakeholder_emails} onChange={handleChange} placeholder="email1@example.com, email2@example.com" />
          <p className="text-xs text-slate-500">Enter comma-separated email addresses.</p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="required_documents">Required Documents</Label>
          <Textarea id="required_documents" name="required_documents" value={formData.required_documents} onChange={handleChange} placeholder="List the documents needed..." rows={3} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="process_description">Process Description</Label>
          <Textarea id="process_description" name="process_description" value={formData.process_description} onChange={handleChange} placeholder="Describe the approval process..." rows={4} />
        </div>

        <div className="space-y-1">
          <Label>Upload Document</Label>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
            <input ref={fileInputRef} type="file" onChange={handleFileUpload} className="hidden" accept=".pdf,.doc,.docx,.jpg,.png" />
            {formData.uploaded_document_url ? (
              <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-slate-700 truncate">Uploaded: {formData.uploaded_document_url}</span>
                </div>
                <Button type="button" variant="ghost" onClick={() => setFormData({ ...formData, uploaded_document_url: "" })}><X className="w-4 h-4" /></Button>
              </div>
            ) : (
              <div>
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</> : <><Upload className="w-4 h-4 mr-2" />Choose File</>}
                </Button>
                <p className="text-xs text-slate-500 mt-2">PDF, DOC, DOCX, JPG, PNG</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isProcessing}>
            {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : (document ? 'Update Document' : 'Add Document')}
          </Button>
        </div>
      </form>
    </div>
  );
}
