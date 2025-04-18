import { useNavigate } from "react-router-dom";
import About from "./About";

export default function FrontPage() {
    const navigate = useNavigate();

    const goToSignUp = () => {
        navigate("/signup");
    }

    return (
        <div className="frontpage">
            <div className="front-page-section">
                <h1>TrackIt!: Nutrition Tracking App</h1>
                <p1>
                    Food and calories tracker 
                </p1>
                <button onClick={goToSignUp}>Sign Up Today!</button>
            </div>
            <About/>
        </div>
    );
}