import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
    const userId = localStorage.getItem("userId");
    const [userData, setUserData] = useState({ firstName: "", lastName: "", email: "" });
    const navigate = useNavigate();

    // FETCH USER DATA 
    useEffect(() => {
        const fetchUserData = async () => {
            const response = await fetch(`http://localhost:5001/user/${userId}`);
            const data = await response.json();
            setUserData({
                firstName: data.first_name,
                lastName: data.last_name,
                email: data.email
            });
        };

        if (userId) fetchUserData();
    }, [userId]);

    const goToFrontPage = () => {
        navigate("/");
    }

    // UPDATE USER'S INFO
    const handleUpdate = async () => {
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        if (password && password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        const response = await fetch("http://localhost:5001/update-user", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, ...userData }),
        });

        const data = await response.json();
        alert(data.message);
    };

    // DELETE USER'S ACCOUNT
    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            return;
        }

        const response = await fetch("http://localhost:5001/delete-user", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
        });

        const data = await response.json();
        alert(data.message);

        goToFrontPage();
    };

    // UI
    return (
        <div className="settings-page">
            <label>First Name</label>
            <input defaultValue={userData.firstName} placeholder={userData.firstName} onChange={(e) => setUserData({...userData, firstName: e.target.value})} />

            <label>Last Name</label>
            <input defaultValue={userData.lastName} placeholder={userData.lastName} onChange={(e) => setUserData({...userData, lastName: e.target.value})} />

            <label>Email</label>
            <input type="email" defaultValue={userData.email} placeholder={userData.email} onChange={(e) => setUserData({...userData, email: e.target.value})} />

            <label>New Password</label>
            <input id="password" type="password" placeholder="New Password" onChange={(e) => setUserData({...userData, password: e.target.value})} />

            <label>Confirm Password</label>
            <input id="confirmPassword" type="password" placeholder="Confirm Password" />

            <button onClick={handleUpdate}>Save</button>
            <button onClick={handleDelete}>Delete Account</button>
        </div>
    );
}