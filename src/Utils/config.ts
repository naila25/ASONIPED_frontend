export const JSONBIN_CONFIG = {
  API_URL: 'https://api.jsonbin.io/v3/b',
  ACCOUNTS: {
    VOLUNTEER: {
      MASTER_KEY: '$2a$10$5iW5mNvCihHbi0EF9JWv1eEyj0krBYq5egcBGd1weGSAcJ3er/ATG',
      BINS: {
        OPTIONS: '682381f38561e97a501336b0',
        FORMS: '6824fd018561e97a5013fbd4',
      }
    },
    DONATION: {
      MASTER_KEY: '$2a$10$BJMzT3zue5BZsi314H8t6u2C73TJwlouGy11ORUKAxfBQNZvrmFii',
      BINS: {
        FORMS: '6825f9d88a456b79669e5167',
      }
    }
  },
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
};