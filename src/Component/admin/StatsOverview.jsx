import React from "react";
import { FileText, XCircle, CheckCircle, Clock4 } from "lucide-react";
import { differenceInDays, parseISO, isValid } from "date-fns";

// Helper function to categorize documents
const getStatusLabel = (expiryDate) => {
  if (!expiryDate || !isValid(parseISO(expiryDate))) return 'Invalid';
  const days = differenceInDays(parseISO(expiryDate), new Date());
  if (days < 0) return 'Expired';
  if (days <= 30) return 'Expiring Soon';
  return 'Active';
};

export default function StatsOverview({ documents }) {
  // Calculate counts based on status
  const activeCount = documents.filter(doc => getStatusLabel(doc.expiry_date) === 'Active').length;
  const expiringSoonCount = documents.filter(doc => getStatusLabel(doc.expiry_date) === 'Expiring Soon').length;
  const expiredCount = documents.filter(doc => getStatusLabel(doc.expiry_date) === 'Expired').length;

  const stats = [
    { title: "Total Documents", value: documents.length, icon: FileText, color: "bg-blue-100 text-blue-600" },
    { title: "Active", value: activeCount, icon: CheckCircle, color: "bg-green-100 text-green-600" },
    { title: "Expiring Soon", value: expiringSoonCount, icon: Clock4, color: "bg-amber-100 text-amber-600" },
    { title: "Expired", value: expiredCount, icon: XCircle, color: "bg-red-100 text-red-600" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <div key={stat.title} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-slate-500">
              {stat.title}
            </p>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.color}`}>
            <stat.icon className="w-5 h-5" />
          </div>
        </div>
      ))}
    </div>
  );
}
