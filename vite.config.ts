import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // React Query
          'react-query': ['@tanstack/react-query'],
          
          // Radix UI components - split into logical groups
          'radix-dialog': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-menubar',
          ],
          'radix-form': [
            '@radix-ui/react-checkbox',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-select',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
            '@radix-ui/react-label',
          ],
          'radix-misc': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-avatar',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-slot',
            '@radix-ui/react-aspect-ratio',
          ],
          
          // Chart library
          'chart-vendor': ['recharts'],
          
          // PDF generation libraries
          'pdf-vendor': ['jspdf', 'jspdf-autotable'],
          
          // Form libraries
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          
          // UI utilities
          'ui-utils': [
            'lucide-react',
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
            'cmdk',
            'vaul',
            'sonner',
            'next-themes',
            'date-fns',
            'react-day-picker',
            'input-otp',
            'embla-carousel-react',
            'react-resizable-panels',
          ],
        },
      },
    },
    // Increase chunk size warning limit (optional)
    chunkSizeWarningLimit: 600,
  },
}));