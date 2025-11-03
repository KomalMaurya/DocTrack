import React, { useEffect } from "react";
import { Mail, CheckCircle } from "lucide-react";
import { format, parseISO, differenceInDays, isValid } from "date-fns";
import supabase from '../../lib/supabase';

// --- Reusable Button ---
const Button = ({ variant = 'default', size = 'md', className = '', children, ...props }) => {
  const sizes = { sm: "h-9 px-3", md: "h-10 py-2 px-4" };
  const variants = {
    outline: "border border-slate-300 bg-transparent hover:bg-slate-100 text-slate-700",
  };
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 ${sizes[size]} ${variants[variant] || ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// --- ReminderPanel Component ---
export default function ReminderPanel({ documents, isLoading, onUpdateDocument }) {

  const MAX_REMINDER_DAYS = 20;

  // Calculate urgency
  const getUrgencyLevel = (expiryDate) => {
    if (!expiryDate || !isValid(parseISO(expiryDate))) return null;
    const daysUntilExpiry = differenceInDays(parseISO(expiryDate), new Date());
    if (daysUntilExpiry < 0) return { level: 'expired', color: 'bg-red-500', textColor: 'text-red-700', days: Math.abs(daysUntilExpiry) };
    if (daysUntilExpiry <= 30) return { level: 'warning', color: 'bg-amber-500', textColor: 'text-amber-700', days: daysUntilExpiry };
    return null;
  };

  // --- Automated Reminder Function ---
  const sendAutomatedReminders = async () => {
    for (let doc of documents) {
      if (!doc.stakeholder_emails || !doc.expiry_date) continue;

      const daysRemaining = differenceInDays(parseISO(doc.expiry_date), new Date());
      const lastSent = doc.last_reminder_sent ? parseISO(doc.last_reminder_sent) : null;
      const today = new Date();
      const alreadySentToday = lastSent && lastSent.toDateString() === today.toDateString();

      // Only send if ≤ 20 days remaining and not already sent today
      if (daysRemaining <= MAX_REMINDER_DAYS && !alreadySentToday) {
        try {
          const emails = doc.stakeholder_emails.split(',').map(e => e.trim());

          // Invoke Supabase function to send email
          const { error } = await supabase.functions.invoke('send_email_reminder', {
            body: { emails, documentName: doc.name, expiryDate: doc.expiry_date }
          });
          if (error) throw error;

          // Update last_reminder_sent in Supabase
          const { error: updateError } = await supabase
            .from('documents')
            .update({ last_reminder_sent: new Date().toISOString() })
            .eq('id', doc.id);

          if (!updateError) onUpdateDocument(doc.id, { last_reminder_sent: new Date().toISOString() });

          console.log(`Automated reminder sent for ${doc.name} to ${emails.join(', ')}`);
        } catch (err) {
          console.error('Failed to send automated reminder:', err);
        }
      }
    }
  };

  // Run automated reminders on documents update
  useEffect(() => {
    if (!isLoading && documents.length > 0) {
      sendAutomatedReminders();
    }
  }, [documents, isLoading]);

  // Filter and sort documents needing attention
  const documentsNeedingAttention = documents
    .map(doc => ({ ...doc, urgency: getUrgencyLevel(doc.expiry_date) }))
    .filter(doc => doc.urgency !== null)
    .sort((a, b) => (a.urgency?.days || 0) - (b.urgency?.days || 0));

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Mail className="w-5 h-5 text-blue-700" />Email Reminders
      </h2>

      {isLoading ? (
        <p>Loading reminders...</p>
      ) : documentsNeedingAttention.length === 0 ? (
        <div className="p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">All documents are up to date!</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200">
          {documentsNeedingAttention.map((doc) => {
            const lastSentToday = doc.last_reminder_sent && new Date(doc.last_reminder_sent).toDateString() === new Date().toDateString();
            return (
              <div key={doc.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className={`w-1.5 h-full min-h-[3rem] rounded-full ${doc.urgency.color}`} />
                    <div>
                      <h3 className="font-semibold text-slate-900">{doc.name}</h3>
                      <p className="text-xs font-medium mt-1">
                        {lastSentToday ? <span className="text-green-700">✅ Reminder Sent Today</span> :
                          (doc.urgency.level === 'expired' ? `⚠️ Expired ${doc.urgency.days} days ago` :
                          `⏰ Expires in ${doc.urgency.days} days`)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Stakeholders: {doc.stakeholder_emails || 'None configured'}</p>
                      {doc.last_reminder_sent && <p className="text-xs text-slate-500">Last reminder: {format(parseISO(doc.last_reminder_sent), 'MMM dd, yyyy')}</p>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
