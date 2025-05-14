import React from 'react'
import App from '@/App'
import { store } from '@/store'
import { createRoot } from 'react-dom/client'
import config from '@/config'

// style + assets
import '@/assets/scss/style.scss'

// third party
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { SnackbarProvider } from 'notistack'
import ConfirmContextProvider from '@/store/context/ConfirmContextProvider'
import { ReactFlowContext } from '@/store/context/ReactFlowContext'

// Security check for iframe embedding
const checkAncestors = () => {
    try {
        // Skip check if not in an iframe
        if (window.self === window.top) {
            return // Not in an iframe
        }
        
        // Get parent URL
        const parentOrigin = window.parent.location.origin
        
        // Check if parent origin is allowed
        if (!config.isOriginAllowed(parentOrigin)) {
            throw new Error(`Embedding not allowed from: ${parentOrigin}`)
        }
    } catch (error) {
        // Security error or disallowed ancestor
        if (!error.toString().includes('cross-origin')) {
            console.error('Embedding error:', error)
            document.body.innerHTML = '<h1>Embedding not allowed from this origin</h1>'
        }
    }
}

// Run security check
checkAncestors()

const container = document.getElementById('root')
const root = createRoot(container)

root.render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <SnackbarProvider>
                    <ConfirmContextProvider>
                        <ReactFlowContext>
                            <App />
                        </ReactFlowContext>
                    </ConfirmContextProvider>
                </SnackbarProvider>
            </BrowserRouter>
        </Provider>
    </React.StrictMode>
)
