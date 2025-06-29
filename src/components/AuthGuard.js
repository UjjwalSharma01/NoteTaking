'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LoadingPage } from '@/components/LoadingSpinner';

/**
 * AuthGuard component for protecting routes that require authentication
 */
export default function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingPage />;
  }

  if (!user) {
    return null; // Redirecting...
  }

  return children;
}

/**
 * Higher-order component for protecting routes that require authentication
 */
export function withAuth(WrappedComponent) {
  return function AuthenticatedComponent(props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push('/auth/login');
      }
    }, [user, loading, router]);

    if (loading) {
      return <LoadingPage />;
    }

    if (!user) {
      return null; // Redirecting...
    }

    return <WrappedComponent {...props} />;
  };
}

/**
 * Higher-order component for protecting routes that require email verification
 */
export function withEmailVerification(WrappedComponent) {
  return function EmailVerifiedComponent(props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push('/auth/login');
      } else if (!loading && user && !user.emailVerified) {
        router.push('/auth/verify-email');
      }
    }, [user, loading, router]);

    if (loading) {
      return <LoadingPage />;
    }

    if (!user || !user.emailVerified) {
      return null; // Redirecting...
    }

    return <WrappedComponent {...props} />;
  };
}

/**
 * Higher-order component for protecting routes that should redirect if user is already authenticated
 */
export function withoutAuth(WrappedComponent) {
  return function UnauthenticatedComponent(props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && user) {
        router.push('/dashboard');
      }
    }, [user, loading, router]);

    if (loading) {
      return <LoadingPage />;
    }

    if (user) {
      return null; // Redirecting...
    }

    return <WrappedComponent {...props} />;
  };
}
