import Container from '@/components/Container';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <Container className="flex items-center justify-center py-12">
      <LoginForm />
    </Container>
  );
}