import { useCallback, useState } from "react";
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types";
import { PaginatedTransactionsResult } from "./types";
import { useCustomFetch } from "./useCustomFetch";

export function usePaginatedTransactions(): PaginatedTransactionsResult {
  const { fetchWithCache, loading } = useCustomFetch();
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<Transaction[]> | null>(null);
  const [hasMoreData, setHasMoreData] = useState(true); // New state to track if more data is available

  const fetchAll = useCallback(async () => {
    if (!hasMoreData) return; // Prevent fetching if no more data is available

    const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
      "paginatedTransactions",
      {
        page: paginatedTransactions === null ? 0 : paginatedTransactions.nextPage,
      }
    );

    setPaginatedTransactions((previousResponse) => {
      if (response === null) {
        return previousResponse;
      }

      // Update the data and append the new data if it exists
      const updatedData = {
        data: previousResponse ? [...previousResponse.data, ...response.data] : response.data,
        nextPage: response.nextPage,
      };

      // Set hasMoreData to false if there’s no nextPage, indicating the end of the data
      setHasMoreData(response.nextPage !== null);

      return updatedData;
    });
  }, [fetchWithCache, paginatedTransactions, hasMoreData]);

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null);
    setHasMoreData(true); // Reset hasMoreData when data is invalidated
  }, []);

  return { data: paginatedTransactions, loading, fetchAll, hasMoreData, invalidateData };
}
