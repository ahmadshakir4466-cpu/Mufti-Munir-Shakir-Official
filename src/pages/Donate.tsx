import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import GenericHeader from "../components/layout/GenericHeader";
import { useLanguage } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import { supabase } from "../lib/supabase";
import { Landmark, Check, Gift, Phone, Mail, Copy } from "lucide-react";

export default function Donate() {
  const { lang } = useLanguage();
  const { sections } = useSettings();
  const [method, setMethod] = useState("easypaisa");
  const [copiedField, setCopiedField] = useState<string | null>(null);
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

  useEffect(() => {
    const loadDonationAccounts = async () => {
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
          console.error("Error parsing donation accounts settings", e);
        }
      }
    };
    loadDonationAccounts();
  }, []);

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text.trim());
    setCopiedField(fieldId);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  if (!sections.contact) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <GenericHeader 
        titleEn="Donate & Support" 
        titleUr="تعاون اور عطیات" 
      />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Gift className="w-12 h-12 text-primary-700 mx-auto mb-4 animate-bounce" />
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {lang === "en" ? "Support Our Mission" : "ہماری تحریک کا حصہ بنیں"}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {lang === "en"
              ? "Your support helps us continue spreading authentic Islamic knowledge, developing multimedia content, and managing religious resources."
              : "آپ کا تعاون ہمیں مستند اسلامی تعلیمات پھیلانے، معیاری ملٹی میڈیا مواد تیار کرنے اور دینی وسائل کے انتظام کو جاری رکھنے میں مدد دیتا ہے۔"}
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl shadow-md border border-gray-150 p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-center gap-2">
              <Landmark className="w-5 h-5 text-primary-700" />
              {lang === "en" ? "Direct Donation Methods" : "براہ راست تعاون کے طریقے"}
            </h3>
            
            {/* Payment Methods Quick Tabs */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <button
                type="button"
                onClick={() => setMethod("easypaisa")}
                className={`py-3 px-2 rounded-xl text-xs md:text-sm font-bold border transition-all cursor-pointer flex flex-col items-center gap-2 ${
                  method === "easypaisa"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                Easypaisa
              </button>

              <button
                type="button"
                onClick={() => setMethod("jazzcash")}
                className={`py-3 px-2 rounded-xl text-xs md:text-sm font-bold border transition-all cursor-pointer flex flex-col items-center gap-2 ${
                  method === "jazzcash"
                    ? "border-red-600 bg-red-50/50 text-red-800 shadow-sm"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span>
                JazzCash
              </button>

              <button
                type="button"
                onClick={() => setMethod("bank")}
                className={`py-3 px-2 rounded-xl text-xs md:text-sm font-bold border transition-all cursor-pointer flex flex-col items-center gap-2 ${
                  method === "bank"
                    ? "border-primary-600 bg-primary-50 text-primary-800 shadow-sm"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-primary-700 inline-block"></span>
                {lang === "en" ? "Bank Account" : "بینک اکاؤنٹ"}
              </button>
            </div>

            {/* Method Details Card */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-150">
              {method === "easypaisa" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-500 font-medium">{lang === "en" ? "Mobile Account" : "موبائل اکاؤنٹ"}</span>
                    <span className="font-bold text-gray-900 text-lg">Easypaisa</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-500 font-medium">{lang === "en" ? "Account Title" : "اکاؤنٹ کا نام"}</span>
                    <span className="font-bold text-gray-900">{accounts.easypaisa_title}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">{lang === "en" ? "Mobile Number" : "نمبر"}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary-800 text-xl tracking-wider select-all">
                        {accounts.easypaisa_number}
                      </span>
                      <button
                        onClick={() => handleCopy(accounts.easypaisa_number, "easypaisa")}
                        className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-emerald-600 hover:border-emerald-300 transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
                        title={lang === "en" ? "Copy number" : "نمبر کاپی کریں"}
                      >
                        {copiedField === "easypaisa" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600 text-[10px]">{lang === "en" ? "Copied!" : "کاپی ہو گیا"}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[10px]">{lang === "en" ? "Copy" : "کاپی"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {method === "jazzcash" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-500 font-medium">{lang === "en" ? "Mobile Account" : "موبائل اکاؤنٹ"}</span>
                    <span className="font-bold text-gray-900 text-lg">JazzCash</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-500 font-medium">{lang === "en" ? "Account Title" : "اکاؤنٹ کا نام"}</span>
                    <span className="font-bold text-gray-900">{accounts.jazzcash_title}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">{lang === "en" ? "Mobile Number" : "نمبر"}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary-800 text-xl tracking-wider select-all">
                        {accounts.jazzcash_number}
                      </span>
                      <button
                        onClick={() => handleCopy(accounts.jazzcash_number, "jazzcash")}
                        className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-red-600 hover:border-red-300 transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
                        title={lang === "en" ? "Copy number" : "نمبر کاپی کریں"}
                      >
                        {copiedField === "jazzcash" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-red-600" />
                            <span className="text-red-600 text-[10px]">{lang === "en" ? "Copied!" : "کاپی ہو گیا"}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[10px]">{lang === "en" ? "Copy" : "کاپی"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {method === "bank" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-500 font-medium">{lang === "en" ? "Bank Name" : "بینک کا نام"}</span>
                    <span className="font-bold text-gray-900">{accounts.bank_name}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-500 font-medium">{lang === "en" ? "Account Title" : "اکاؤنٹ کا نام"}</span>
                    <span className="font-bold text-gray-900">{accounts.bank_title}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-500 font-medium">{lang === "en" ? "Account Number" : "اکاؤنٹ نمبر"}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-gray-900 tracking-wider select-all">{accounts.bank_number}</span>
                      <button
                        onClick={() => handleCopy(accounts.bank_number, "bank_num")}
                        className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-primary-700 hover:border-primary-300 transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
                        title={lang === "en" ? "Copy account number" : "اکاؤنٹ نمبر کاپی کریں"}
                      >
                        {copiedField === "bank_num" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-primary-700" />
                            <span className="text-primary-700 text-[10px]">{lang === "en" ? "Copied!" : "کاپی ہو گیا"}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[10px]">{lang === "en" ? "Copy" : "کاپی"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">IBAN</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary-800 text-xs sm:text-sm select-all">
                        {accounts.bank_iban}
                      </span>
                      <button
                        onClick={() => handleCopy(accounts.bank_iban, "bank_iban")}
                        className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-primary-700 hover:border-primary-300 transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
                        title={lang === "en" ? "Copy IBAN" : "آئی بی اے این کاپی کریں"}
                      >
                        {copiedField === "bank_iban" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-primary-700" />
                            <span className="text-primary-700 text-[10px]">{lang === "en" ? "Copied!" : "کاپی ہو گیا"}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[10px]">{lang === "en" ? "Copy" : "کاپی"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-between items-center bg-primary-50/50 p-4 rounded-xl border border-primary-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-800 flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{lang === "en" ? "Need help?" : "رہنمائی درکار ہے؟"}</h4>
                  <p className="text-xs text-gray-600">{accounts.support_phone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-800 flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{lang === "en" ? "Email support" : "ای میل سپورٹ"}</h4>
                  <p className="text-xs text-gray-600">{accounts.support_email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
