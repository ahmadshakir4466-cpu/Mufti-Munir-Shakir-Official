import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="print:hidden">
        <Navbar />
      </div>
      <main className="flex-grow">
        <Outlet />
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
