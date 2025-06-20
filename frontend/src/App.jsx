import React from 'react';
import { AuthContextProvider } from './context/AuthContext'; 
import AppRouter from './router/AppRouter'; 
import './styles/App.css';

function App() {
  return (
    
    <AuthContextProvider>
      <AppRouter />
    </AuthContextProvider>
  );
}

export default App;