module.exports = {
  extends: [
    // ... 기존 extends 설정들
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    '@typescript-eslint/no-unused-vars': ['error', {
      'varsIgnorePattern': 'React',
      'argsIgnorePattern': '^_',
      'ignoreRestSiblings': true
    }],
    'no-unused-vars': 'off' 
  }
} 