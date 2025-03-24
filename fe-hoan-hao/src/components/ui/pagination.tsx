import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const [inputPage, setInputPage] = useState(currentPage);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 4;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
            <button
                key={i}
                className={cn(
                    "border border-gray-300 rounded-md px-3 py-2 text-sm transition-colors",
                    "hover:bg-pink-500 hover:text-white",
                    i === currentPage && "bg-pink-500 text-white",
                    "max-[480px]:text-xs max-[480px]:px-2 max-[480px]:py-1",
                    "max-[1024px]:text-base max-[1024px]:px-2 max-[1024px]:py-1"
                )}
                onClick={() => onPageChange(i)}
            >
              {i}
            </button>
        );
      }
    } else {
      pageNumbers.push(
          <button
              key={1}
              className={cn(
                  "border border-gray-300 rounded-md px-3 py-2 text-sm transition-colors",
                  "hover:bg-pink-500 hover:text-white",
                  currentPage === 1 && "bg-pink-500 text-white",
                  "max-[480px]:text-xs max-[480px]:px-2 max-[480px]:py-1",
                  "max-[1024px]:text-base max-[1024px]:px-2 max-[1024px]:py-1"
              )}
              onClick={() => onPageChange(1)}
          >
            1
          </button>
      );

      if (currentPage > 3) {
        pageNumbers.push(
            <span key="ellipsis-start" className="px-3 py-2 text-gray-700">
            ...
          </span>
        );
      }

      for (let i = Math.max(2, currentPage - 1); i <= Math.min(currentPage + 1, totalPages - 1); i++) {
        pageNumbers.push(
            <button
                key={i}
                className={cn(
                    "border border-gray-300 rounded-md px-3 py-2 text-sm transition-colors",
                    "hover:bg-pink-500 hover:text-white",
                    i === currentPage && "bg-pink-500 text-white",
                    "max-[480px]:text-xs max-[480px]:px-2 max-[480px]:py-1",
                    "max-[1024px]:text-base max-[1024px]:px-2 max-[1024px]:py-1"
                )}
                onClick={() => onPageChange(i)}
            >
              {i}
            </button>
        );
      }

      if (currentPage < totalPages - 2) {
        pageNumbers.push(
            <span key="ellipsis-end" className="px-3 py-2 text-gray-700">
            ...
          </span>
        );
      }

      pageNumbers.push(
          <button
              key={totalPages}
              className={cn(
                  "border border-gray-300 rounded-md px-3 py-2 text-sm transition-colors",
                  "hover:bg-pink-500 hover:text-white",
                  totalPages === currentPage && "bg-pink-500 text-white",
                  "max-[480px]:text-xs max-[480px]:px-2 max-[480px]:py-1",
                  "max-[1024px]:text-base max-[1024px]:px-2 max-[1024px]:py-1"
              )}
              onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </button>
      );
    }

    return pageNumbers;
  };

  const handleInputChange = (e) => {
    const value = Math.min(Math.max(e.target.value, 1), totalPages);
    setInputPage(value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      onPageChange(inputPage);
    }
  };

  return (
      <div className="flex flex-col items-center justify-center mt-5">
        <div className="flex items-center justify-center">
          <button
              className={cn(
                  "border border-gray-300 rounded-md px-4 py-2 mx-2 text-sm transition-colors",
                  "hover:bg-pink-500 hover:text-white",
                  currentPage === 1 && "bg-gray-200 text-gray-400 cursor-not-allowed",
                  "max-[480px]:text-xs max-[480px]:px-2 max-[480px]:py-1",
                  "max-[1024px]:text-base max-[1024px]:px-3 max-[1024px]:py-1"
              )}
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
          >
            {"<"}
          </button>
          <div className="flex items-center">{renderPageNumbers()}</div>
          <button
              className={cn(
                  "border border-gray-300 rounded-md px-4 py-2 mx-2 text-sm transition-colors",
                  "hover:bg-pink-500 hover:text-white",
                  currentPage === totalPages && "bg-gray-200 text-gray-400 cursor-not-allowed",
                  "max-[480px]:text-xs max-[480px]:px-2 max-[480px]:py-1",
                  "max-[1024px]:text-base max-[1024px]:px-3 max-[1024px]:py-1"
              )}
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
          >
            {">"}
          </button>
        </div>

        <div className="flex items-center justify-center mt-2">
          <input
              type="number"
              value={inputPage}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              min={1}
              max={totalPages}
              className={cn(
                  "w-12 p-1 text-center border border-gray-300 rounded-md mr-1 text-sm",
                  "max-[480px]:text-xs max-[480px]:p-1",
                  "max-[1024px]:text-base max-[1024px]:p-1"
              )}
              aria-label="Go to page"
          />
          <span className="text-gray-700">/{totalPages}</span>
        </div>
      </div>
  );
};

Pagination.displayName = "Pagination";

export default Pagination;