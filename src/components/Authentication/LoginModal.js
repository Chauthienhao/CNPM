//npm install bootstrap
import React, { useState } from "react";
//import { NavLink } from "react-router-dom";
import './LoginModal.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const LoginModal = ({ onClose, onOpenSignup, onLoginSuccess }) => {
    const [showpassword, setShowpassword] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // success or error
    const handleClick = () => setShowpassword(!showpassword);

    const SubmitHandler = async (e) => {
        e.preventDefault();
        setMessage("");
        setMessageType("");

        // Client-side validation
        if (!username.trim()) {
            setMessage("Username không được để trống.");
            setMessageType("error");
            return;
        }
        if (password.length < 6) {
            setMessage("Mật khẩu phải có ít nhất 6 ký tự.");
            setMessageType("error");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setMessageType("success");
                setTimeout(() => onLoginSuccess(), 1000); // Close modal after 1 second
            } else {
                setMessage(data.message);
                setMessageType("error");
            }
        } catch (error) {
            console.error('Lỗi:', error);
            setMessage('Lỗi kết nối máy chủ.');
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-modal-overlay">
            <div className="card login-card">
                <div className="card-header">
                    <h1><i className="fas fa-sign-in-alt me-2"></i>Log In</h1>
                    <button type="button" className="btn-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="card-body">
                    {message && (
                        <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-danger'} mb-3`}>
                            {message}
                        </div>
                    )}
                    <form onSubmit={SubmitHandler}>
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label">
                                <i className="fas fa-user me-2"></i>Username
                            </label>
                            <input
                                type="text"
                                className="form-control input-field"
                                id="username"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">
                                <i className="fas fa-lock me-2"></i>Password
                            </label>
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
                                    <i className={`fas ${showpassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                </button>
                            </div>
                        </div>
                        <div className="mb-3 d-flex justify-content-between align-items-center">
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="remember" />
                                <label className="form-check-label" htmlFor="remember">
                                    <i className="fas fa-check me-1"></i>Remember me
                                </label>
                            </div>
                            <a href="#" className="text-decoration-none">
                                <i className="fas fa-key me-1"></i>Forgot Password
                            </a>
                        </div>
                        <div className="d-grid">
                            <button type="submit" className="btn btn-warning" disabled={loading}>
                                <i className="fas fa-sign-in-alt me-2"></i>
                                {loading ? 'Đang đăng nhập...' : 'Log In'}
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