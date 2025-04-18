// Used to prevent full page reload 
import { Link, useLocation } from "react-router-dom"

export default function Bar() {
    const location = useLocation();
    const isMainPage = location.pathname === "/main";
    const isFrontPage = location.pathname === "/";
    const isJournalPage = location.pathname === "/journal";
    const isLoginPage = location.pathname === "/login";
    const isSignUpPage = location.pathname === "/signup";
    const isSettingsPage = location.pathname === "/settings";

    return (
        <div className="bar">
            <div className="links">
                {isFrontPage && (
                    <>
                    <Link to="/">TrackIt!</Link>
                    <Link to="/login">Login</Link>
                    </>
                )}
                {isLoginPage && (
                    <>
                    <Link to="/">TrackIt!</Link>
                    <Link to="/signup">Sign Up</Link>
                    </>
                )}
                {isSignUpPage && (
                    <>
                    <Link to="/">TrackIt!</Link>
                    <Link to="/login">Log In</Link>
                    </>
                )}
                {(isMainPage || isJournalPage) && (
                    <>
                    <Link to="/main">TrackIt!</Link>
                    <Link to="/journal">Journal</Link>
                    <Link to="/settings">Settings</Link>
                    <Link to="/">Log out</Link>
                    </>
                )}
                {(isSettingsPage) && (
                    <>
                    <Link to="/main">TrackIt!</Link>
                    <Link to="/journal">Journal</Link>
                    <Link to="/">Log out</Link>
                    </>
                )}
            </div>
        </div>
    );
}