/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                kavach: {
                    bg: '#0a0f1e',
                    surface: '#111827',
                    border: '#1f2937',
                    accent: '#3b82f6',
                    critical: '#ef4444',
                    high: '#f97316',
                    medium: '#eab308',
                    low: '#22c55e',
                    text: '#f9fafb',
                    muted: '#6b7280',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
        },
    },
    plugins: [],
};
