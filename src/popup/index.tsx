import "../index.css";
import React from 'react';
import { createRoot } from 'react-dom/client';
import Popup from './Popup';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root');
  if (container) {
    createRoot(container).render(<Popup />);
  }
});
