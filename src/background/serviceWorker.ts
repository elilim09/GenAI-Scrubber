import { log } from '../utils/logger';

chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    const headers = details.requestHeaders || [];
    headers.push({ name: 'X-GenAI-Scrubber', value: '1' });
    return { requestHeaders: headers };
  },
  { urls: ['<all_urls>'] },
  ['blocking', 'requestHeaders'],
);

chrome.alarms.onAlarm.addListener((alarm) => {
  log('Alarm fired', alarm.name);
});
