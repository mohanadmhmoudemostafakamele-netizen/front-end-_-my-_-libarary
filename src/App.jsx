
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BookLibrary from './components/BookLibrary';
import BookChatPage from './components/BookChatPage';
import AboutMe from './components/AboutMe';
import Login from './components/Login';
import Profile from './components/Profile';

function App() {
  return (
    <Router>
      <Routes>
        {/* التوجيه التلقائي للصفحة الرئيسية للمكتبة */}
        <Route path="/" element={<Navigate to="/library" replace />} />
        <Route path="/library" element={<BookLibrary />} />

        {/* مسار صفحة الشات السيبراني المستقلة للإيجنت */}
        <Route path="/ai-chat" element={<BookChatPage />} />

        {/* باقي صفحات الموقع */}
        <Route path="/about" element={<AboutMe />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;