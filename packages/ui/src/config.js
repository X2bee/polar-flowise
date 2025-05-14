const config = {
    // basename: only at build time to set, and Don't add '/' at end off BASENAME for breadcrumbs, also Don't put only '/' use blank('') instead,
    basename: '',
    defaultPath: '/chatflows',
    // You can specify multiple fallback fonts
    fontFamily: `'Inter', 'Roboto', 'Arial', sans-serif`,
    borderRadius: 12,
    // Allowed domains that can embed this app in an iframe
    allowedAncestorsSet: new Set([
        "https://polarops.x2bee.com",
        ...(import.meta.env.VITE_ALLOWED_IFRAME_ORIGINS || '').split(',').filter(Boolean)
        // Add more allowed domains here
    ])
}

export default config
