import React from "react";
import "../css/home.css";
import logo from "../assets/images/Aasarelogo.jpg"; // Correctly import the image

function Home() {
    return (
        <div className="home-container">
            <nav className="navbar">
                <img src={logo} alt="Logo" className="logo" />
                <div className="button-container">
                    <a href="/login" className="log">
                        <button className="button-35" role="button">Sign In</button>
                    </a>
                    <a href="/register" className="reg">
                        <button className="button-35" role="button">Sign Up</button>
                    </a>
                </div>
            </nav>
            <div className="home-content">
                <h1 className="home-title">Aasare</h1>
            </div>
        </div>
    );
}

export default Home;
