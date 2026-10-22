const TEST_USERS = require('../../scripts/test-users');

describe('test database seed users', () => {
  test('includes admin and both regular users from the expected test dataset', () => {
    expect(TEST_USERS).toEqual([
      expect.objectContaining({ phone: '09999999999', role: 'admin' }),
      expect.objectContaining({ phone: '09111111111', role: 'regular' }),
      expect.objectContaining({ phone: '09222222222', role: 'regular' }),
    ]);
  });

  test('does not contain duplicate phone numbers', () => {
    const phones = TEST_USERS.map(({ phone }) => phone);
    expect(new Set(phones).size).toBe(phones.length);
  });
});
