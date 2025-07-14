import "../index.css";
import React from 'react';
import { createRoot } from 'react-dom/client';
import Options from './options';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root');
  if (container) {
    createRoot(container).render(<Options />);
  }
});
