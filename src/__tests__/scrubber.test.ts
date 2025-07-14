import { scrubText } from '../content/scrubber';

test('scrub phone number', async () => {
  const { clean, stats } = await scrubText('call me 010-1234-5678');
  expect(clean).not.toContain('010-1234-5678');
  expect(stats.replacedPhones).toBe(1);
});
