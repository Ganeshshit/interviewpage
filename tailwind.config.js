export default {
    darkMode: ['class'],
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        './pages/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: 'hsl(var(--card))',
                cardForeground: 'hsl(var(--card-foreground))',
                primary: 'hsl(var(--primary))',
                primaryForeground: 'hsl(var(--primary-foreground))',
                secondary: 'hsl(var(--secondary))',
                secondaryForeground: 'hsl(var(--secondary-foreground))',
                muted: 'hsl(var(--muted))',
                mutedForeground: 'hsl(var(--muted-foreground))',
                accent: 'hsl(var(--accent))',
                accentForeground: 'hsl(var(--accent-foreground))',
                destructive: 'hsl(var(--destructive))',
                destructiveForeground: 'hsl(var(--destructive-foreground))',
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
            },
            borderRadius: {
                lg: 'var(--radius)',
            },
        },
    },
    plugins: [],
}
