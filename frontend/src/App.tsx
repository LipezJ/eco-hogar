import { RouterProvider, Router } from '@/lib/router';
import { generateRoutes } from '@/lib/router/generateRoutes';
import { AuthProvider } from '@/components/auth-provider';
import { TanstackProvider } from '@/components/tanstack-provider';
import { ThemeProvider } from 'next-themes';
import ScrollToTop from '@/components/layout/scroll-top';

function App() {
  const routes = generateRoutes();

  return (
    <RouterProvider>
      <AuthProvider>
          <TanstackProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
               <Router routes={routes} />
              <ScrollToTop />
            </ThemeProvider>
          </TanstackProvider>
        </AuthProvider>
    </RouterProvider>
  );
}

export default App
