'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/auth/me');
        setUser(res.data.user);
      } catch (err) {
        router.push('/login');
      }
    };
    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    await axios.post('/auth/logout');
    router.push('/login');
  };

  return (
    <div className="max-w-2xl mx-auto mt-20 p-4 text-center">
      <h1 className="text-3xl font-bold mb-4">
        Welcome, {user?.name || 'Guest'}!
      </h1>
      <button
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
}
