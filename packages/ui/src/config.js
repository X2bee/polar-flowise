const config = {
    // basename: only at build time to set, and Don't add '/' at end off BASENAME for breadcrumbs, also Don't put only '/' use blank('') instead,
    basename: '',
    defaultPath: '/chatflows',
    // You can specify multiple fallback fonts
    fontFamily: `'Inter', 'Roboto', 'Arial', sans-serif`,
    borderRadius: 12,
    // Allowed domains that can embed this app in an iframe
    allowedOrigins: [
        'http://localhost:5173',
        'https://polarops.x2bee.com',
        ...(import.meta.env.VITE_ALLOWED_IFRAME_ORIGINS || '').split(',').filter(Boolean)
        // Add more allowed domains here
    ],
    // Function to check if an origin is allowed
    isOriginAllowed: function(origin) {
        if (!origin) return false
        
        // Allow if origin is in the allowedOrigins list
        if (this.allowedOrigins.includes(origin)) return true
        
        // Check for wildcard domains (*.example.com)
        return this.allowedOrigins.some(allowed => {
            if (allowed.startsWith('*.')) {
                const domain = allowed.substring(2)
                return origin.endsWith(domain) && origin.lastIndexOf('.', origin.length - domain.length - 1) !== -1
            }
            return false
        })
    }
}

export default config
