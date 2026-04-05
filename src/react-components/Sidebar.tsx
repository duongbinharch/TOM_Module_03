import * as React from "react";
import * as Router from "react-router-dom";

export function Sidebar() {
    const companyLogoUrl = new URL("../../assets/Binh-Company.svg", import.meta.url).href;
    
    return (
        <aside id="sidebar">
            <img id="company-logo" src={companyLogoUrl} alt="Construction Company" />
            <ul id="nav-buttons">
            <Router.Link to="/">
                <li><span className="material-icons-round">apartment</span>Projects</li>
            </Router.Link>
            
            <li><span className="material-icons-round">people</span>Users</li>
            
            </ul>
        </aside>
    )
}