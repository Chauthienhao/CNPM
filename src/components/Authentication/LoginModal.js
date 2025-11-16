//npm install bootstrap
import React, { useState } from "react";
//import { NavLink } from "react-router-dom";
import './LoginModal.css';

const LoginModal = ({ onClose, onOpenSignup, onLoginSuccess }) => {
    const [showpassword, setShowpassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const handleClick = () => setShowpassword(!showpassword);

    const SubmitHandler = (e) => {
        e.preventDefault();
        // Hard-coded credentials
        const validEmail = "admin@gmail.com";
        const validPassword = "123";

        if (email === validEmail && password === validPassword) {
            alert("Login successful!");
            onLoginSuccess(); // Close modal after successful login
        } else {
            alert("Invalid email or password. Please try again.");
        }
    };

    return (
        <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
            <div className="card login-card" style={{ width: "400px" }}>
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h1 className="text-center mb-0">Log In</h1>
                    <button type="button" className="btn-close" onClick={onClose}></button>
                </div>
                <div className="card-body">
                    <form onSubmit={SubmitHandler}>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control input-field"
                                id="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Password</label>
                            <div className="input-group">
                                <input
                                    type={showpassword ? "text" : "password"}
                                    className="form-control input-field"
                                    id="password"
                                    placeholder="Enter Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    className="btn btn-dark"
                                    type="button"
                                    onClick={handleClick}
                                >
                                    {showpassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>
                        <div className="mb-3 d-flex justify-content-between align-items-center">
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="remember" />
                                <label className="form-check-label" htmlFor="remember">
                                    Remember me
                                </label>
                            </div>
                            <a href="#" className="text-decoration-none">Forgot Password</a>
                        </div>
                        <div className="d-grid">
                            <button type="submit" className="btn btn-warning">
                                Log In
                            </button>
                        </div>
                        <div className="text-center mt-3">
                            Don't have an account? <a onClick={(e) => {e.preventDefault(); onOpenSignup()}}>Sign up</a> 
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;