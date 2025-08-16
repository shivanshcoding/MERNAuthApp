'use client';

import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import axios from '@/lib/api';

export default function GoogleLoginBtn() {
  const router = useRouter();

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      await axios.post('/auth/google-login', {
        token: credentialResponse.credential,
      });
      router.push('/dashboard');
    } catch (err) {
      alert('Google login failed');
    }
  };

  return (
    <div className="flex justify-center mt-2">
      <GoogleLogin onSuccess={handleLoginSuccess} onError={() => alert('Google login error')} />
    </div>
  );
}
