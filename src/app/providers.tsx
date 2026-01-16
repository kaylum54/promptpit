'use client';

import { Auth0Provider } from '@auth0/nextjs-auth0';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Auth0Provider>
      {children}
    </Auth0Provider>
  );
}
