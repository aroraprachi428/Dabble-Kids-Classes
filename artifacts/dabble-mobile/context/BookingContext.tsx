import React, { createContext, useContext, useState } from 'react';
import type { Coach, TrialSlot } from '@workspace/api-client-react';

type BookingState = { coach?: Coach; slot?: TrialSlot };
type BookingContextValue = BookingState & {
  selectCoach: (coach: Coach) => void;
  selectSlot: (slot: TrialSlot) => void;
  clear: () => void;
};
const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BookingState>({});
  return (
    <BookingContext.Provider value={{
      ...state,
      selectCoach: (coach) => setState((old) => ({ ...old, coach })),
      selectSlot: (slot) => setState((old) => ({ ...old, slot })),
      clear: () => setState({}),
    }}>
      {children}
    </BookingContext.Provider>
  );
}
export function useBooking() {
  const value = useContext(BookingContext);
  if (!value) throw new Error('useBooking must be used inside BookingProvider');
  return value;
}