import PageContentEditor from "../../components/admin/PageContentEditor";

export default function AdminFooter() {
  return (
    <div className="space-y-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Footer Content</h1>
      <PageContentEditor 
        pageKey="footer_about" 
        pageTitle="Footer (About Section)"
        defaultEnTitle="About"
        defaultUrTitle="ہمارے بارے میں"
        defaultEnContent="Dedicated to spreading the true teachings of Islam, providing spiritual guidance, and serving the community through knowledge."
        defaultUrContent="اسلام کی حقیقی تعلیمات پھیلانے، روحانی رہنمائی فراہم کرنے اور علم کے ذریعے معاشرے کی خدمت کے لیے وقف۔"
      />
      <PageContentEditor 
        pageKey="footer_contact" 
        pageTitle="Footer (Contact Info)"
        defaultEnTitle="Contact Info"
        defaultUrTitle="رابطہ کی معلومات"
        defaultEnContent="ahmadshakir4466@gmail.com\n+92 302 4620110\nLahore, Pakistan"
        defaultUrContent="ahmadshakir4466@gmail.com\n+92 302 4620110\nلاہور، پاکستان"
      />
    </div>
  );
}
