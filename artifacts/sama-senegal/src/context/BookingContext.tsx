import { createContext, useContext, useState, ReactNode } from "react";

type BookingContextType = {
  openBooking: (tourName?: string) => void;
  bookingOpen: boolean;
  closeBooking: () => void;
  preselectedTour: string | undefined;
};

export const BookingContext = createContext<BookingContextType>({
  openBooking: () => {},
  bookingOpen: false,
  closeBooking: () => {},
  preselectedTour: undefined,
});

export function useBooking() {
  return useContext(BookingContext);
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [preselectedTour, setPreselectedTour] = useState<string | undefined>();

  const openBooking = (tourName?: string) => {
    setPreselectedTour(tourName);
    setBookingOpen(true);
  };

  const closeBooking = () => {
    setBookingOpen(false);
    setPreselectedTour(undefined);
  };

  return (
    <BookingContext.Provider value={{ openBooking, bookingOpen, closeBooking, preselectedTour }}>
      {children}
    </BookingContext.Provider>
  );
}
