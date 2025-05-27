// app/context/DashboardContext.js
'use client';
import { createContext, useState, useContext } from 'react';

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const [editPublication, setEditPublication] = useState(null);

  return (
    <DashboardContext.Provider value={{ editPublication, setEditPublication }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}