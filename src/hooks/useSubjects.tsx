import { getAllSubjects } from "@/utils/serverActions/subject";
import { useEffect, useState } from "react";
import { ISubject } from "@/models/Subject";

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const fetchSubjects = async () => {
    setIsLoading(true);
    try {
      const response = await getAllSubjects();
      if (response?.data) {
        setSubjects(response.data as ISubject[]);
      }
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return { subjects, isLoading, error, refetch: fetchSubjects };
};
