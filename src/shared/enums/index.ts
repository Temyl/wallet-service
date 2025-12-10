export enum DURATION {
  SECONDS = 1_000,
  MINUTES = 60 * SECONDS,
  HOURS = 60 * MINUTES,
  DAYS = 24 * HOURS,
}

export enum API_KEY_STATUS {
  ACTIVE = 'active',
  EXPIRE = 'expired',
  REVOKE = 'revoke'
}

export enum TRANSACTION_STATUS {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum TRANSACTION_TYPE {
  DEPOSIT = 'deposit',
  TRANSFER = 'transfer',
  WITHDRAWAL = 'wothdrawal'
}

export enum ApiKeyExpiry {
  ONE_HOUR = '1H',
  ONE_DAY = '1D',
  ONE_MONTH = '1M',
  ONE_YEAR = '1Y',
}
