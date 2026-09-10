import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";

// FIX 1: Remove the curly braces and import it as UserInfo (JavaScript map it automatically from the default export)
import UserInfo from "./pages/UserInfo.jsx"; 

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      {/* FIX 2: Keep using <UserInfo /> here */}
      <Route path="/UserInfo" element={<UserInfo />} /> 
    </Routes>
  );
}

export default App;
