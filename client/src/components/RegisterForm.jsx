import React, { useState, useEffect } from 'react'
import './Register.css'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from "../src/context/AuthContext.jsx";

const Register = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const delay = async (d) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, d * 1000);
        })
    }
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm();

    const username = watch("username");
    const [usernameTaken, setUsernameTaken] = useState(false);
    const [navigating, setNavigating] = useState(false);

    useEffect(() => {
        const delay = setTimeout(async () => {
            if (username && username.trim().length > 2) {
                try {
                    const res = await fetch("http://localhost:3000/check-username", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ username })
                    });
                    const result = await res.json();
                    setUsernameTaken(result.exists);
                } catch (err) {
                    console.error("Username check error:", err.message);
                    setUsernameTaken(false);
                }
            } else {
                setUsernameTaken(false);
            }
        }, 600); // debounce

        return () => clearTimeout(delay);
    }, [username]);

    const onSubmit = async (data) => {
        if (usernameTaken) {
            alert("Username is already taken. Please choose another.");
            return;
        }
        try {
            await delay(2);
            const res = await fetch("http://localhost:3000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (result.value) {
                console.log(result.message);
                setNavigating(true);
                await delay(3);
                await login(data);
                navigate("/dashboard");
            } else {
                console.warn(result.message);
            }
        } catch (error) {
            console.error("Network or Server Error:", error.message);
        }
    };



    return (
        <div className="register-wrapper">
            <div className="register-cont">
                <form onSubmit={handleSubmit(onSubmit)} className="register-form">
                    <div className="register-row">
                        <label className="register-label" htmlFor="name">Name:</label>
                        <div className="register-err">
                            <input {...register("name", {
                                required: "This field is required"
                            })} placeholder="Enter your name" />
                            {errors.name && <div>{errors.name.message}</div>}
                        </div>
                    </div>
                    <div className="register-row">
                        <label className="register-label" htmlFor="age">Age:</label>
                        <div className="register-err">
                            <input {...register("age", {
                                min: { value: 0, message: "Enter correct Age" }
                            })} placeholder="Enter your age" />
                            {errors.age && <div>{errors.age.message}</div>}
                        </div>
                    </div>
                    <div className="register-row">
                        <label className="register-label" htmlFor="email">Email:</label>
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
                        <label className="register-label" htmlFor="add">Address:</label>
                        <div className="register-err">
                            <input {...register("add")} placeholder="Enter your address" />
                        </div>
                    </div>
                    <div className="register-row">
                        <label className="register-label" htmlFor="username">Username:</label>
                        <div className="register-err">
                            <input
                                {...register("username", {
                                    required: "This field is required"
                                })}
                                placeholder="Enter your username"
                            />
                            {errors.username && <div>{errors.username.message}</div>}
                            {username && usernameTaken && (<div className="username-warning">Username already taken</div>)}
                        </div>
                    </div>
                    <div className="register-row">
                        <label className="register-label" htmlFor="password">Password:</label>
                        <div className="register-err">
                            <input {...register("password", {
                                required: "This field is required"
                            })} placeholder="Enter your password" />
                            {errors.password && <div>{errors.password.message}</div>}
                        </div>
                    </div>
                    <button type="submit" disabled={isSubmitting} className={isSubmitting ? "reg-submitting" : "register-button"}>
                        {isSubmitting ? "Registering..." : "Register"}
                    </button>
                </form>
            </div>
            {navigating ? (<div className='register-final-verdict'>Registered Successfully... Navigating to Dashboard</div>) : (null)}
            <div className="login-message">
                Already have an account? <Link to="/login">Login</Link>
            </div>
        </div>
    )
}

export default Register

