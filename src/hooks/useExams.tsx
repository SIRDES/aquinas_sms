import { getAllFridayTestBatch } from "@/utils/serverActions/fridayTestBatch";
import { IFridayTestBatch } from "@/models/FridayTestBatch";
import { useEffect, useState } from "react";
import { IAcademicYear } from "@/models/AcademicYear";

export interface IExam extends IFridayTestBatch {
  academicYearDetails: IAcademicYear;
}

export const useExams = ({ getIsSuspended }: { getIsSuspended?: boolean }) => {
  const [exams, setExams] = useState<IExam[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const fetchExams = async () => {
    setIsLoading(true);
    try {
      const response = await getAllFridayTestBatch(getIsSuspended);
      if (response?.data) {
        setExams(response.data as IExam[]);
      }
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { exams, isLoading, error, refetch: fetchExams };
};
