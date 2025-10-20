export const appConfig = {
  database: {
    host: (process.env.DB_HOST as string) || 'localhost',
    port: parseInt((process.env.DB_PORT as string) || '5432'),
    username: (process.env.DB_USERNAME as string) || 'postgres',
    password: (process.env.DB_PASSWORD as string) || 'password',
    database: (process.env.DB_DATABASE as string) || 'payment_checkout',
  },
  wompi: {
    baseUrl:
      (process.env.WOMPI_BASE_URL as string) ||
      'https://api-sandbox.co.uat.wompi.dev/v1',
    publicKey:
      (process.env.WOMPI_PUBLIC_KEY as string) ||
      'pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7',
    privateKey:
      (process.env.WOMPI_PRIVATE_KEY as string) ||
      'prv_stagtest_5i0ZGIGiFcDQifYsXxvsny7Y37tKqFWg',
    integrityKey:
      (process.env.WOMPI_INTEGRITY_KEY as string) ||
      'stagtest_integrity_nAIBuqayW70XpUqJS4qf4STYiISd89Fp',
  },
  app: {
    port: parseInt((process.env.PORT as string) || '3000'),
    nodeEnv: (process.env.NODE_ENV as string) || 'development',
  },
  products: {
    targetCount: parseInt(
      (process.env.PRODUCTS_TARGET_COUNT as string) || '100',
    ),
    usdToCopRate: parseInt((process.env.USD_TO_COP_RATE as string) || '4000'),
  },
};
