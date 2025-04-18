import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const navigate = useNavigate();

    useEffect (() => {
        alert("Demo => Email: demo@gmail.com Password: 1234");
    });

    const handleLogin = async (e) => {
        e.preventDefault();

        const email = e.target.email.value;
        const password = e.target.password.value;

        // Check if form is entered
        if (!email || !password) {
            alert("Please enter in all fields.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5001/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({email, password}),
            });

            const data = await response.json();

            if (response.ok) {
                // Store user ID
                localStorage.setItem("userId", data.userId);
                console.log(localStorage.getItem("userId"));
                window.location.href = "/main";
            }
            else {
                alert(data.error);
            }
        }
        catch (error) {
            alert("Error.")
        }
    }

    const goToSignUp = () => {
        navigate("/signup");
    }

    return (
        <div className="loginpage">
            <p>Login to your account</p>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Email:</label>
                    <input type="email" name="email" required></input>
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" name="password" required></input>
                </div>
                <div>
                    <button type="submit">Login</button>
                </div>
            </form>
            <div>
                <button onClick={goToSignUp}>Sign Up</button>
            </div>
        </div>
    );
}