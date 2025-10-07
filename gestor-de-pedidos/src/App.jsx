import { useState } from "react";
import LoginPage from "./Pages/Login";
import RegisterPage from "./Pages/Register";

export default function App() {
  const [screen, setScreen] = useState("login"); // 'login' | 'register'

  return screen === "login" ? (
    <LoginPage />
  ) : (
    <RegisterPage onGoToLogin={() => setScreen("login")} />
  );
}
