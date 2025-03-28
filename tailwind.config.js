// /** @type {import('tailwindcss').Config} */
// export default {
//     darkMode: ['class'],
//     content: [
//         './index.html',
//         './src/**/*.{js,ts,jsx,tsx}',
//         './src/components/**/*.{js,ts,jsx,tsx}',
//         './src/pages/**/*.{js,ts,jsx,tsx}',
//         './src/App.jsx',
//         './src/main.jsx',
//     ],
//     theme: {
//         extend: {
//             colors: {
//                 border: 'hsl(var(--border))',
//                 input: 'hsl(var(--input))',
//                 ring: 'hsl(var(--ring))',
//                 background: {
//                     DEFAULT: 'hsl(var(--background))',
//                 },
//                 foreground: {
//                     DEFAULT: 'hsl(var(--foreground))',
//                 },
//                 primary: {
//                     DEFAULT: 'hsl(var(--primary))',
//                     foreground: 'hsl(var(--primary-foreground))',
//                 },
//                 secondary: {
//                     DEFAULT: 'hsl(var(--secondary))',
//                     foreground: 'hsl(var(--secondary-foreground))',
//                 },
//                 destructive: {
//                     DEFAULT: 'hsl(var(--destructive))',
//                     foreground: 'hsl(var(--destructive-foreground))',
//                 },
//                 muted: {
//                     DEFAULT: 'hsl(var(--muted))',
//                     foreground: 'hsl(var(--muted-foreground))',
//                 },
//                 accent: {
//                     DEFAULT: 'hsl(var(--accent))',
//                     foreground: 'hsl(var(--accent-foreground))',
//                 },
//                 popover: {
//                     DEFAULT: 'hsl(var(--popover))',
//                     foreground: 'hsl(var(--popover-foreground))',
//                 },
//                 card: {
//                     DEFAULT: 'hsl(var(--card))',
//                     foreground: 'hsl(var(--card-foreground))',
//                 },
//             },
//             borderRadius: {
//                 lg: 'var(--radius)',
//                 md: 'calc(var(--radius) - 2px)',
//                 sm: 'calc(var(--radius) - 4px)',
//             },
//         },
//     },
//     plugins: [],
// }
/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class', // Enable dark mode support
    content: [
        './index.html', // Root HTML file
        './src/**/*.{js,ts,jsx,tsx}', // Scan all JS/TS/JSX/TSX files in src folder
    ],
    theme: {
        extend: {
            colors: {
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
            },
        },
    },
    plugins: [],
};
