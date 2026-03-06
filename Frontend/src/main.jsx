import React from 'react';
import ReactDOM from 'react-dom/client';
import './main.css';
import App from './App';
import { UserProvider } from '../contextapi'; // Import the UserProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
<UserProvider>
<App />
</UserProvider>
  </React.StrictMode>
);

