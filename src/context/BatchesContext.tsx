"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export const BatchesContext = createContext<any>({});

type BatchesContextProviderProps = {
  children: React.ReactNode;
};
export const BatchesContextProvider = ({
  children,
}: BatchesContextProviderProps) => {
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [adminSettings, setAdminSettings] = useState<any>(null);
  const [batches, setBatches] = useState<Array<any>>([]);
  const [fetchedBatches, setFetchedBatches] = useState<Array<any>>([]);

  useEffect(() => {
    // console.log(selectedBatch);
    if (batches.length === 0) return;
    setSelectedBatch(batches[0]);
  }, [batches]);

  const value = {
    selectedBatch,
    setSelectedBatch,
    batches,
    fetchedBatches,
    setBatches,
    setFetchedBatches,
    adminSettings,
    setAdminSettings,
  };

  return (
    <BatchesContext.Provider value={value}>{children}</BatchesContext.Provider>
  );
};

export const useBatchesContext = () => useContext(BatchesContext);
