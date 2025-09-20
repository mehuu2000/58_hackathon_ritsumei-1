'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
  isNavigationExpanded: boolean;
  setIsNavigationExpanded: (expanded: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [isNavigationExpanded, setIsNavigationExpanded] = useState(false);

  return (
    <NavigationContext.Provider value={{ isNavigationExpanded, setIsNavigationExpanded }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}