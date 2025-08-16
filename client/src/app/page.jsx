'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/api';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get('/auth/me'); // placeholder route if you want
      } catch (err) {
        router.push('/login');
      }
    };
    checkAuth();
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Welcome to your dashboard!</h1>
      <p className="mt-4">You're now logged in and verified 🎉</p>
    </main>
  );
}

