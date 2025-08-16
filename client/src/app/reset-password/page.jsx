"use client";
import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import axios from '@/lib/api';
import './reset-password.css';

const ResetPasswordPage = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const router = useRouter();

  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await axios.post('/auth/reset-password', {
        email,
        token,
        newPassword: data.password,
      });
      if (res.data.message) {
        setDone(true);
        setTimeout(() => router.push('/login'), 3000);
      }
    } catch (err) {
      console.error('Reset error:', err.response?.data || err.message);
    }
  };

  return (
    <div className="reset-container">
      {done ? (
        <div className="reset-success">Password reset successful! Redirecting to login...</div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="reset-form">
          <label className="reset-label">New Password:</label>
          <input
            type="password"
            className="reset-input"
            {...register('password', { required: 'Password required' })}
            placeholder="Enter new password"
          />
          {errors.password && <p className="reset-error">{errors.password.message}</p>}

          <label className="reset-label">Confirm Password:</label>
          <input
            type="password"
            className="reset-input"
            {...register('confirm', {
              validate: val => val === watch('password') || "Passwords do not match"
            })}
            placeholder="Confirm new password"
          />
          {errors.confirm && <p className="reset-error">{errors.confirm.message}</p>}

          <button type="submit" disabled={isSubmitting} className="reset-button">
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPasswordPage;
