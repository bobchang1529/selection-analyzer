/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,ts,js,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        ui: ['"Inter var"', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', '"Noto Sans TC"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        // 讓 Tailwind 顏色可以讀 CSS 變數（tokens.css 會定義）
        brand: 'var(--plv-brand)',
        ink: 'var(--plv-ink)',
        muted: 'var(--plv-muted)',
        surface: 'var(--plv-surface)',
        line: 'var(--plv-line)',
      },
      borderRadius: {
        xl2: '1rem',
      },
    },
  },
  daisyui: {
    // 以 CSS 變數驅動的 DaisyUI 主題，避免與 Tailwind 衝突
    themes: [
      {
        plv: {
          'primary': 'var(--plv-brand)',
          'primary-content': '#fff',
          'secondary': '#64748b',
          'accent': '#0ea5e9',
          'neutral': '#1f2937',
          'base-100': 'var(--plv-surface)',
          'base-content': 'var(--plv-ink)',
          'info': '#60a5fa',
          'success': '#10b981',
          'warning': '#f59e0b',
          'error': '#ef4444',
        },
      },
      'light', 'dark',
    ],
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/forms')({ strategy: 'class' }), // 不覆蓋原生表單
  ],
};
