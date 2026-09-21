import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './pages/SignIn';
import IntroScreen from './pages/IntroScreen';
import Setup from './pages/Setup';
import Auction from './pages/Auction';
import Results from './pages/Results';
import PlayOptions from './pages/PlayOptions';
import CreateRoom from './pages/CreateRoom';
import Lobby from './pages/Lobby';
import JoinRoom from './pages/JoinRoom';
import AdminSync from './pages/AdminSync';
import { AuctionProvider } from './context/AuctionContext';

function App() {
  return (
    <AuctionProvider>
      <Router>
        <main style={{ flex: '1', display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#141315' }}>
          <Routes>
            <Route path="/" element={<IntroScreen />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/auction" element={<Auction />} />
            <Route path="/results" element={<Results />} />
            <Route path="/play-options" element={<PlayOptions />} />
            <Route path="/create-room" element={<CreateRoom />} />
            <Route path="/lobby/:roomCode" element={<Lobby />} />
            <Route path="/join/:roomCode" element={<JoinRoom />} />
            <Route path="/join-room" element={<JoinRoom />} />
            <Route path="/join" element={<JoinRoom />} />
            <Route path="/admin/sync" element={<AdminSync />} />
          </Routes>
        </main>
      </Router>
    </AuctionProvider>
  );
}

export default App;


