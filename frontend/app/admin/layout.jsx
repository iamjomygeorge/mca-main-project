import AdminSidebar from "@/components/AdminSidebar";
import Container from "@/components/Container";

export default function AdminLayout({ children }) {
  return (
    <Container className="py-12">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        <aside className="w-full md:w-56">
          <div className="md:sticky md:top-24">
            <h2 className="text-lg font-semibold mb-4 pl-3">Control Panel</h2>
            <AdminSidebar />
          </div>
        </aside>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </Container>
  );
}