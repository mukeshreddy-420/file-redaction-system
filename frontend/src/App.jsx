import { useState } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [showSignup, setShowSignup] = useState(false);

  if (!user) {
    return showSignup ? (
      <Signup setShowSignup={setShowSignup} />
    ) : (
      <Login setUser={setUser} setShowSignup={setShowSignup} />
    );
  }

  return <Dashboard user={user} setUser={setUser} />;

}
