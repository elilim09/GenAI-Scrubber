import React from 'react';
import { useEffect, useState } from 'react';

export default function Options(): JSX.Element {
  const [learning, setLearning] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get('learning', (data) => setLearning(Boolean(data.learning)));
  }, []);

  const toggle = () => {
    const next = !learning;
    setLearning(next);
    chrome.storage.sync.set({ learning: next });
  };

  return (
    <div className="p-4">
      <label className="flex items-center space-x-2">
        <input type="checkbox" checked={learning} onChange={toggle} />
          <span>Learning mode (don&apos;t replace, just warn)</span>
      </label>
    </div>
  );
}
