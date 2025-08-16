// File: app/register/page.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/authContext';
import api from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [usernameTaken, setUsernameTaken] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const username = watch("username");

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (username?.trim().length > 2) {
        try {
          const res = await api.post("/auth/check-username", { username });
          setUsernameTaken(res.data.exists);
        } catch (err) {
          console.error("Username check error:", err.message);
          setUsernameTaken(false);
        }
      } else {
        setUsernameTaken(false);
      }
    }, 600);
    return () => clearTimeout(timeout);
  }, [username]);

  const onSubmit = async (data) => {
    if (usernameTaken) {
      alert("Username is already taken.");
      return;
    }
    try {
      const res = await api.post("/auth/register", data);
      if (res.data.value) {
        setNavigating(true);
        await new Promise(res => setTimeout(res, 3000));
        await login(data);
        router.push("/verify-email");
      } else {
        console.warn(res.data.message);
      }
    } catch (error) {
      console.error("Register error:", error.message);
    }
  };

  const handleGoogle = async () => {
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`;
  };

  return (
    <div className="register-wrapper">
      <div className="register-cont">
        <form onSubmit={handleSubmit(onSubmit)} className="register-form">
          <div className="register-row">
            <label className="register-label">Name:</label>
            <div className="register-err">
              <input {...register("name", { required: "This field is required" })} placeholder="Enter your name" />
              {errors.name && <div>{errors.name.message}</div>}
            </div>
          </div>

          <div className="register-row">
            <label className="register-label">Age:</label>
            <div className="register-err">
              <input {...register("age", {
                min: { value: 0, message: "Enter correct Age" }
              })} placeholder="Enter your age" />
              {errors.age && <div>{errors.age.message}</div>}
            </div>
          </div>

          <div className="register-row">
            <label className="register-label">Email:</label>
            <div className="register-err">
              <input {...register("email", {
                required: "This field is required",
                pattern: {
                  value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                  message: "Invalid email format"
                }
              })} placeholder="Enter your email" />
              {errors.email && <div>{errors.email.message}</div>}
            </div>
          </div>

          <div className="register-row">
            <label className="register-label">Username:</label>
            <div className="register-err">
              <input {...register("username", {
                required: "This field is required"
              })} placeholder="Enter your username" />
              {errors.username && <div>{errors.username.message}</div>}
              {username && usernameTaken && (
                <div className="username-warning">Username already taken</div>
              )}
            </div>
          </div>

          <div className="register-row">
            <label className="register-label">Password:</label>
            <div className="register-err">
              <input type="password" {...register("password", {
                required: "This field is required"
              })} placeholder="Enter your password" />
              {errors.password && <div>{errors.password.message}</div>}
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className={isSubmitting ? "reg-submitting" : "register-button"}>
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>

        <button onClick={handleGoogle} className="google-button">Continue with Google</button>

        {navigating && <div className="register-final-verdict">Registered Successfully... Navigating</div>}
        <div className="login-message">
          Already have an account? <a href="/login">Login</a>
        </div>
      </div>
    </div>
  );
}
