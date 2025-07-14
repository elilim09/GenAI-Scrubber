import React from 'react';
import { useEffect, useState } from 'react';

export function Popup(): JSX.Element {
  const [count, setCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    chrome.storage.sync.get(['count', 'logs'], (data) => {
      setCount(data.count || 0);
      setLogs(data.logs || []);
    });
  }, []);

  return (
    <div className="p-4 w-60">
      <h1 className="text-lg font-bold mb-2">genai-scrubber</h1>
      <p>Today: {count} scrubs</p>
      <ul className="text-xs mt-2 list-disc ml-4">
        {logs.slice(0, 10).map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </div>
  );
}
export default Popup;
