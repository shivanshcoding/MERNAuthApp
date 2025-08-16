'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from '@/lib/api';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('Verifying...');

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const verify = async () => {
      try {
        await axios.get(`/auth/verify-email?token=${token}&email=${email}`);
        setStatus('Email verified. Redirecting...');
        setTimeout(() => router.push('/dashboard'), 1500);
      } catch {
        setStatus('Invalid or expired token.');
      }
    };

    if (token && email) verify();
    else setStatus('Missing token or email.');
  }, [searchParams, router]);

  return (
    <div className="max-w-md mx-auto mt-20 text-center text-xl">{status}</div>
  );
}
