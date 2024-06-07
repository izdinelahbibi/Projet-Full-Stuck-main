import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <img src="/path/to/logo.png" alt="ISET KEBILI Logo" className="logo" />
                </Link>
                <h1 className="navbar-title">ISET KEBILI</h1>
                <div className="navbar-links">
                    <Link to="/">Home</Link>
                    <Link to="/about">About</Link>
                    <Link to="/contact">Contact</Link>
                </div>
            </div>
            <style jsx>{`
                .navbar {
                    background-color: #333;
                    color: white;
                    padding: 10px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .navbar-container {
                    display: flex;
                    align-items: center;
                }

                .navbar-logo .logo {
                    height: 40px;
                    margin-right: 15px;
                }

                .navbar-title {
                    font-size: 24px;
                    font-weight: bold;
                }

                .navbar-links a {
                    color: white;
                    margin: 0 10px;
                    text-decoration: none;
                }

                .navbar-links a:hover {
                    text-decoration: underline;
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
