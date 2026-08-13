import { useEffect, useState } from "react";
import { getAllAcademicYears } from "@/utils/serverActions/academicYear";
import { IAcademicYear } from "@/models/AcademicYear";

export const useAcademicYears = () => {
  const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const fetchAcademicYears = async () => {
    setIsLoading(true);
    try {
      const response = await getAllAcademicYears();
      if (response?.data) {
        setAcademicYears(response.data as IAcademicYear[]);
      }
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  return { academicYears, isLoading, error, refetch: fetchAcademicYears };
};
