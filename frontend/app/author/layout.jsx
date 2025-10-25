import AuthorSidebar from "@/components/AuthorSidebar";
import Container from "@/components/Container";

export default function AuthorLayout({ children }) {
  // Add logic here later to redirect if user is not an author
  // const { user, loading } = useAuth();
  // const router = useRouter();
  // useEffect(() => { if (!loading && user?.role !== 'AUTHOR') router.push('/'); }, [user, loading, router]);
  // if (loading || user?.role !== 'AUTHOR') return <div>Loading...</div>; // Or a proper loading/unauthorized state

  return (
    <Container className="py-12">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        <aside className="w-full md:w-56">
          <div className="md:sticky md:top-24">
            <h2 className="text-lg font-semibold mb-4 pl-3">Author Panel</h2>
            <AuthorSidebar />
          </div>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </Container>
  );
}