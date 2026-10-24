// Тестове оточення: окрема БД, фіксовані секрети, вимкнений dev-вхід.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL_RUN ?? process.env.TEST_DATABASE_URL ?? 'postgresql://polski:polski@localhost:5432/polskigo_test';
process.env.SESSION_SECRET = 'test-secret-test-secret-test-secret-123';
process.env.TELEGRAM_BOT_TOKEN = '123456:TEST_TOKEN';
process.env.TELEGRAM_WEBHOOK_SECRET = 'hook-secret';
process.env.DEV_AUTH = 'false';
process.env.ANTHROPIC_API_KEY = '';
