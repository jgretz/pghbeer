import type {Config} from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        golden: '#f6d898',
      },
    },
  },
} satisfies Config;
