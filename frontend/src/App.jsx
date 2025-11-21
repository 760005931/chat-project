import { useState } from 'react';
import Login from './components/Login';
import ChatRoom from './components/ChatRoom';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (name) => {
    setUsername(name);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUsername('');
    setIsLoggedIn(false);
  };

  return (
    <div className="app-container">
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <ChatRoom username={username} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
