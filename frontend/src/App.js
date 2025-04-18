import Bar from "./components/Bar";
import FrontPage from "./components/FrontPage";
import SignUpPage from "./components/SignUpPage";
import Main from "./components/Main";
import "./styles/app.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import Journal from "./components/Journal";
import { useState } from "react";
import Settings from "./components/Settings";


function App() {

  const [journal, setJournal] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
  });

  return (
    <Router>
      <div className="App">
      {/* Leave <Bar></Bar> outside <Routes> so it stays in all web pages */}
      <Bar></Bar>
      <Routes>
        <Route path="/" element={<FrontPage/>}></Route>
        <Route path="/signup" element={<SignUpPage/>}></Route>
        <Route path="/main" element={<Main journal={journal} setJournal={setJournal}/>}></Route>
        <Route path="/login" element={<LoginPage/>}></Route>
        <Route path="/journal" element={<Journal journal={journal} setJournal={setJournal}/>}></Route>
        <Route path="/settings" element={<Settings/>}></Route>
      </Routes>
      </div>
    </Router>
  );
}

export default App;
