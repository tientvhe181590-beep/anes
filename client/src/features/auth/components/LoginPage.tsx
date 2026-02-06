/**
 * LoginPage — Login screen entry point.
 * SRS 3.1.1.2 — Email/password authentication with Google OAuth option.
 *
 * Wraps LoginForm in AuthLayout with navigation links.
 */
import { Link } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your fitness journey"
      footer={
        <p>
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-(--accent) transition-colors hover:text-(--accent-hover)"
          >
            Sign Up
          </Link>
        </p>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
