import React, { useEffect, useState } from 'react';

export default function Popup(): JSX.Element {
  const [count, setCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [learning, setLearning] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(['dailyScrubCount', 'scrubLogs'], (data) => {
      setCount(data.dailyScrubCount || 0);
      setLogs((data.scrubLogs as string[]) || []);
    });
    chrome.storage.sync.get('learningMode', (data) => {
      setLearning(Boolean(data.learningMode));
    });
  }, []);

  const toggle = (): void => {
    const next = !learning;
    setLearning(next);
    chrome.storage.sync.set({ learningMode: next });
  };

  return (
    <div className="p-4 w-72 font-sans text-sm">
      <h1 className="text-lg font-bold mb-2">genai-scrubber</h1>
      <div className="flex items-center mb-2">
        <span className="mr-2">Today</span>
        <span className="bg-blue-500 text-white rounded-full px-2 text-xs">
          {count}
        </span>
      </div>
      <table className="w-full text-xs mb-3">
        <tbody>
          {logs.slice(0, 10).map((l, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="py-1 px-1 truncate">{l}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <label className="flex items-center space-x-2">
        <input type="checkbox" checked={learning} onChange={toggle} />
        <span>Learning mode (warn only)</span>
      </label>
    </div>
  );
}
