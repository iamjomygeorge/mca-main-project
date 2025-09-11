import Container from '@/components/Container';
import RegisterForm from './RegisterForm';

interface RegisterPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const resolvedSearchParams = await searchParams;
  const role = resolvedSearchParams?.['role'];

  return (
    <Container className="flex items-center justify-center py-12">
      <RegisterForm role={role} />
    </Container>
  );
}