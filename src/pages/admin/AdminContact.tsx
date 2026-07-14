import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Trash, Landmark, Phone, Mail, Check, AlertCircle, Loader2 } from "lucide-react";

export default function AdminContact() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"accounts" | "submissions">("accounts");

  // Donation accounts state
  const [accounts, setAccounts] = useState({
    easypaisa_title: "Ahmad Shakir / Mufti Munir Shakir",
    easypaisa_number: "0302 4620110",
    jazzcash_title: "Ahmad Shakir / Mufti Munir Shakir",
    jazzcash_number: "0302 4620110",
    bank_name: "Meezan Bank Ltd.",
    bank_title: "Ahmad Shakir",
    bank_number: "0284 0107 8651 22",
    bank_iban: "PK81MEZN02840107865122",
    support_phone: "+92 302 4620110",
    support_email: "ahmadshakir4466@gmail.com"
  });
  const [savingDonations, setSavingDonations] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setMessages(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();

    const fetchDonationAccounts = async () => {
      const { data } = await supabase
        .from("page_content")
        .select("content_en")
        .eq("page_name", "donation_accounts")
        .maybeSingle();
      if (data && data.content_en) {
        try {
          const parsed = JSON.parse(data.content_en);
          setAccounts(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error("Error loading donation accounts:", e);
        }
      }
    };
    fetchDonationAccounts();

    const channel = supabase.channel('contact-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSaveDonations = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDonations(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase.from("page_content").upsert({
        page_name: "donation_accounts",
        title_en: "Donation Accounts Configuration",
        content_en: JSON.stringify(accounts)
      }, { onConflict: "page_name" });

      if (error) throw error;
      setSuccessMsg("Donation account details successfully saved!");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Galti hui: " + err.message);
    } finally {
      setSavingDonations(false);
    }
  };

  const handleDelete = async (id: string|null) => {
    if (!id) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) {
      console.error("Error deleting:", error.message);
    } else {
      fetchMessages();
    }
    setDeleteTargetId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Donations Management</h1>
          <p className="text-gray-500 mt-1">Manage payment details displayed to visitors or view legacy transaction submissions.</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-gray-100 p-1.5 rounded-xl border border-gray-200">
          <button
            onClick={() => setActiveTab("accounts")}
            className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "accounts"
                ? "bg-white text-primary-800 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Payment Accounts (تفصیلات)
          </button>
          <button
            onClick={() => setActiveTab("submissions")}
            className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "submissions"
                ? "bg-white text-primary-800 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            User Submissions ({messages.length})
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl animate-fade-in">
          <Check className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span className="text-sm font-semibold">{errorMsg}</span>
        </div>
      )}

      {activeTab === "accounts" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/70">
            <h2 className="text-lg font-bold text-gray-800">Donation & Payment Accounts Setup</h2>
            <p className="text-gray-500 text-xs mt-1">Directly change names and numbers of Easypaisa, JazzCash, Bank and contact details.</p>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSaveDonations} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Easypaisa */}
                <div className="space-y-4 p-4 border border-emerald-100 rounded-xl bg-emerald-50/10">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <h3 className="font-bold text-sm">Easypaisa Details</h3>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Account Title</label>
                    <input
                      type="text"
                      value={accounts.easypaisa_title}
                      onChange={(e) => setAccounts({ ...accounts, easypaisa_title: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white"
                      placeholder="Account Title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Mobile Number</label>
                    <input
                      type="text"
                      value={accounts.easypaisa_number}
                      onChange={(e) => setAccounts({ ...accounts, easypaisa_number: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white font-mono"
                      placeholder="03xx xxxxxxx"
                      required
                    />
                  </div>
                </div>

                {/* JazzCash */}
                <div className="space-y-4 p-4 border border-red-100 rounded-xl bg-red-50/10">
                  <div className="flex items-center gap-2 text-red-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                    <h3 className="font-bold text-sm">JazzCash Details</h3>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Account Title</label>
                    <input
                      type="text"
                      value={accounts.jazzcash_title}
                      onChange={(e) => setAccounts({ ...accounts, jazzcash_title: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white"
                      placeholder="Account Title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Mobile Number</label>
                    <input
                      type="text"
                      value={accounts.jazzcash_number}
                      onChange={(e) => setAccounts({ ...accounts, jazzcash_number: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white font-mono"
                      placeholder="03xx xxxxxxx"
                      required
                    />
                  </div>
                </div>

                {/* Bank Account */}
                <div className="space-y-4 p-4 border border-primary-100 rounded-xl bg-primary-50/10 md:col-span-2">
                  <div className="flex items-center gap-2 text-primary-800">
                    <Landmark className="w-4 h-4" />
                    <h3 className="font-bold text-sm">Bank Account Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={accounts.bank_name}
                        onChange={(e) => setAccounts({ ...accounts, bank_name: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white"
                        placeholder="e.g. Meezan Bank Ltd."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Account Title</label>
                      <input
                        type="text"
                        value={accounts.bank_title}
                        onChange={(e) => setAccounts({ ...accounts, bank_title: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white"
                        placeholder="Account Title"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Account Number</label>
                      <input
                        type="text"
                        value={accounts.bank_number}
                        onChange={(e) => setAccounts({ ...accounts, bank_number: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white font-mono"
                        placeholder="Account Number"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">IBAN</label>
                      <input
                        type="text"
                        value={accounts.bank_iban}
                        onChange={(e) => setAccounts({ ...accounts, bank_iban: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white font-mono"
                        placeholder="PKxxxxxxxxxxxxxxxxxxxx"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Support details */}
                <div className="space-y-4 p-4 border border-gray-200 rounded-xl bg-gray-50/50 md:col-span-2">
                  <h3 className="font-bold text-gray-800 text-sm">Help & Support Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Support Phone</label>
                      <input
                        type="text"
                        value={accounts.support_phone}
                        onChange={(e) => setAccounts({ ...accounts, support_phone: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white"
                        placeholder="+92 xxx xxxxxxx"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Support Email</label>
                      <input
                        type="email"
                        value={accounts.support_email}
                        onChange={(e) => setAccounts({ ...accounts, support_email: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white"
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex justify-end">
                <button
                  disabled={savingDonations}
                  type="submit"
                  className="bg-primary-800 hover:bg-primary-900 text-white font-bold py-3 px-8 rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  {savingDonations ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save & Update Details"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === "submissions" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary-800" />
              Loading submissions...
            </div>
          ) : messages.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No donation or message submissions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-4 font-medium text-gray-600 text-sm">Date</th>
                    <th className="p-4 font-medium text-gray-600 text-sm">Name</th>
                    <th className="p-4 font-medium text-gray-600 text-sm">Email</th>
                    <th className="p-4 font-medium text-gray-600 text-sm">Subject / Payment Method</th>
                    <th className="p-4 font-medium text-gray-600 text-sm">Message / Contribution Details</th>
                    <th className="p-4 font-medium text-gray-600 text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {messages.map((msg) => (
                    <tr key={msg.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-semibold text-gray-900 text-sm">{msg.name}</td>
                      <td className="p-4 text-gray-600 text-sm font-mono">{msg.email}</td>
                      <td className="p-4 text-gray-900 font-semibold text-sm">{msg.subject}</td>
                      <td className="p-4 text-gray-600 max-w-xs whitespace-pre-wrap text-xs font-mono" title={msg.message}>
                        {msg.message}
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => setDeleteTargetId(msg.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors cursor-pointer">
                          <Trash size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {deleteTargetId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4 border border-gray-100 transform scale-100 transition-all">
            <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
            <p className="text-sm text-gray-500">Are you sure you want to delete this record? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end pt-2">
              <button 
                onClick={() => setDeleteTargetId(null)} 
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(deleteTargetId)} 
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
