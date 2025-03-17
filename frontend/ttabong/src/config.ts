const config = {
  baseURL: import.meta.env.VITE_API_URL || 'http://ttabong.store' || 'http://localhost:8080',
  apiPrefix: '/api',
  timeout: 5000,
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-unused-vars': 'warn',
    'unused-imports/no-unused-imports': 'warn',
  }
} as const;

export default config;
