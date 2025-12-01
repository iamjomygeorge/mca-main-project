import Container from '@/components/Container';
import RegisterForm from '@/components/RegisterForm';
import { Suspense } from 'react';

function RegisterPageContent() {
  return (
    <Container className="flex items-center justify-center py-12">
      <RegisterForm />
    </Container>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}