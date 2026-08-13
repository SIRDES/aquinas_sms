import {
  getLatestElection,
  getElections,
} from "@/utils/serverActions/election";
import { useEffect, useState } from "react";

export const useAwards = () => {
  const [award, setAward] = useState<any>(null);
  const [allAwards, setAllAwards] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const fetchAwards = async () => {
    setIsLoading(true);
    try {
      const response = await Promise.all([getLatestElection(), getElections()]);
      if (response[0].data) {
        setAward(response[0].data);
      }
      if (response[1].data) {
        setAllAwards(response[1].data);
      }
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAwards();
  }, []);

  return { award, allAwards, isLoading, error, refetch: fetchAwards };
};
