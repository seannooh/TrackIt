export default function SignUpPage() {
    const handleSignUp = async (e) => {
        e.preventDefault();

        const email = e.target.email.value;
        const firstName = e.target.firstName.value;
        const lastName = e.target.lastName.value
        const password = e.target.password.value;
        const confirmPassword = e.target.confirmPassword.value;

        // Check if form is entered
        if (!email || !firstName || !lastName ||!password ||!confirmPassword) {
            alert("Please enter in all fields.");
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        // POST REQUEST
        const response = await fetch('http://localhost:5001/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // TURN DATA INTO JSON
            body: JSON.stringify({
                email,
                firstName,
                lastName,
                password,
            }),
        });

        // HANDLE RESPONSE
        const data = await response.json();

        if (response.ok) {
            // STORE USER ID TO RETRIEVE JOURNAL ENTRIES
            localStorage.setItem("userId", data.userId);
            alert('User created successfully.');
            window.location.href = "/main";
        }
        else {
            alert('Error: ' + data.error);
        }
    }

    return (
        <div className="signuppage">
            <p>Create your account</p>
            <form onSubmit={handleSignUp}>
                <div>
                    <label>Email:</label>
                    <input type="email" name="email" required></input>
                </div>
                <div>
                    <label>First Name:</label>
                    <input type="text" name="firstName" required></input>
                </div>
                <div>
                    <label>Last Name:</label>
                    <input type="text" name="lastName" required></input>
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" name="password" required></input>
                </div>
                <div>
                    <label>Re-enter Password:</label>
                    <input type="password" name="confirmPassword" required></input>
                </div>
                <div>
                    <button type="submit">Sign Up</button>
                </div>
            </form>
        </div>
    );
}
