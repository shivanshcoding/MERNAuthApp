"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from '@/lib/api';
import './reset-request.css';

const ResetRequestPage = () => {
  const [status, setStatus] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await axios.post('/auth/send-reset-email', { email: data.email });
      if (res.data.message) {
        setStatus('sent');
      }
    } catch (err) {
      console.error('Reset request error:', err.response?.data || err.message);
      setStatus('error');
    }
  };

  return (
    <div className="reset-container">
      {status === 'sent' ? (
        <div className="reset-success">Reset email sent. Please check your inbox.</div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="reset-form">
          <label className="reset-label">Enter your email:</label>
          <input
            type="email"
            className="reset-input"
            {...register('email', { required: 'Email is required' })}
            placeholder="Enter your registered email"
          />
          {errors.email && <p className="reset-error">{errors.email.message}</p>}

          <button type="submit" disabled={isSubmitting} className="reset-button">
            {isSubmitting ? 'Sending...' : 'Send Reset Email'}
          </button>

          {status === 'error' && <p className="reset-error">Something went wrong. Try again later.</p>}
        </form>
      )}
    </div>
  );
};

export default ResetRequestPage;
