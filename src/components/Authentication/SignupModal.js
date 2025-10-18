
//npm install react-bootstrap bootstrap
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import './SignupModal.css';

function SignupModal({ onClose, onOpenLogin }) {
    const [showpassword, setShowpassword] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [confirmpassword, setConfirmpassword] = useState("");
    const [password, setPassword] = useState("");

    const handleClick = () => setShowpassword(!showpassword);

    const SubmitHandler = (e) => {
        e.preventDefault();
        alert("Signup successful!");
        onClose();
    };

    return (
        <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
            <div className="card signup-card" style={{ width: "400px" }}>
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h1 className="text-center mb-0">Sign Up</h1>
                    <button type="button" className="btn-close" onClick={onClose}></button>
                </div>
                <div className="card-body">
                    <form onSubmit={SubmitHandler}>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Name</label>
                            <input
                                type="text"
                                className="form-control input-field"
                                id="name"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
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
                        <div className="mb-3">
                            <label htmlFor="confirmpassword" className="form-label">Confirm Password</label>
                            <div className="input-group">
                                <input
                                    type={showpassword ? "text" : "password"}
                                    className="form-control input-field"
                                    id="confirmpassword"
                                    placeholder="Confirm password"
                                    value={confirmpassword}
                                    onChange={(e) => setConfirmpassword(e.target.value)}
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
                        <div className="d-grid">
                            <button type="submit" className="btn btn-warning">
                                Sign Up
                            </button>
                        </div>
                        <div className="text-center mt-3">
                            Already have an account? <a onClick={(e) => {e.preventDefault(); onOpenLogin()}}>Login</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SignupModal;
