import {
  getBankAccount,
  InsufficientFundsError,
  SynchronizationFailedError,
  TransferFailedError,
} from '.';

describe('BankAccount', () => {
  const INIT_B = 500;
  const NEW_B = 2500;

  const myAccount = getBankAccount(INIT_B);
  const someonesAccount = getBankAccount(100);

  test('should create account with initial balance', () => {
    const myBalance = myAccount.getBalance();
    expect(myBalance).toBe(INIT_B);
  });

  test('should throw InsufficientFundsError error when withdrawing more than balance', () => {
    const myBalance = myAccount.getBalance();
    expect(() => myAccount.withdraw(550)).toThrowError(
      new InsufficientFundsError(myBalance),
    );
  });

  test('should throw error when transferring more than balance', () => {
    const myBalance = myAccount.getBalance();
    expect(() => myAccount.transfer(550, someonesAccount)).toThrowError(
      new InsufficientFundsError(myBalance),
    );
  });

  test('should throw error when transferring to the same account', () => {
    expect(() => myAccount.transfer(550, myAccount)).toThrowError(
      new TransferFailedError(),
    );
  });

  test('should deposit money', () => {
    expect(myAccount.deposit(300).getBalance()).toBe(800);
  });

  test('should withdraw money', () => {
    expect(myAccount.withdraw(200).getBalance()).toBe(600);
  });

  test('should transfer money', () => {
    expect(myAccount.transfer(100, someonesAccount).getBalance()).toBe(500);
  });

  test('fetchBalance should return number in case if request did not failed', async () => {
    const balance = await myAccount.fetchBalance();
    if (balance !== null) expect(typeof balance).toBe('number');
  });

  test('should set new balance if fetchBalance returned number', async () => {
    jest.spyOn(myAccount, 'fetchBalance').mockResolvedValueOnce(NEW_B);
    await myAccount.synchronizeBalance();
    const myBalance = myAccount.getBalance();
    expect(myBalance).toBe(NEW_B);
  });

  test('should throw SynchronizationFailedError if fetchBalance returned null', async () => {
    jest.spyOn(myAccount, 'fetchBalance').mockResolvedValueOnce(null);
    await expect(myAccount.synchronizeBalance()).rejects.toThrow(
      SynchronizationFailedError,
    );
  });
});
