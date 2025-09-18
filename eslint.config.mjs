// eslint.config.mjs

// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Ignora o próprio arquivo de configuração e a pasta de build
  {
    ignores: ['eslint.config.mjs', 'dist/'],
  },

  // Configurações recomendadas base
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked, // Configuração mais poderosa, com checagem de tipos
  eslintPluginPrettierRecommended, // Integração com o Prettier (deve ser a última das configs base)

  // Configuração principal do projeto
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        project: true, // Detecta automaticamente o tsconfig mais próximo
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      // === Regras de Segurança de Tipos (Reativadas como 'warn') ===
      // É crucial manter essas regras ativas para aproveitar o poder do TypeScript.
      // Usar 'warn' permite que você veja os problemas sem quebrar o build.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-enum-comparison': 'warn',
      '@typescript-eslint/no-base-to-string': 'warn',
      '@typescript-eslint/no-floating-promises': 'error', // Promises não tratadas são erros graves.
      '@typescript-eslint/require-await': 'warn',

      // === Regras de Limpeza de Código (Imports Não Utilizados) ===
      '@typescript-eslint/no-unused-vars': 'off', // Desabilitar para usar a regra do plugin abaixo
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
);