import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PaginatedTableProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function PaginatedTable({
  pagination,
  onPageChange,
  onLimitChange,
  isLoading = false,
  children,
  className = ""
}: PaginatedTableProps) {
  const [inputPage, setInputPage] = useState(pagination.page.toString());

  const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const page = parseInt(inputPage);
      if (page >= 1 && page <= pagination.totalPages) {
        onPageChange(page);
      } else {
        setInputPage(pagination.page.toString());
      }
    }
  };

  const handlePageInputBlur = () => {
    const page = parseInt(inputPage);
    if (page >= 1 && page <= pagination.totalPages) {
      onPageChange(page);
    } else {
      setInputPage(pagination.page.toString());
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Table Content */}
      <div className={`${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
        {children}
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Show</span>
            <Select
              value={pagination.limit.toString()}
              onValueChange={(value) => onLimitChange(parseInt(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span>
              of {pagination.total.toLocaleString()} results
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* First Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={!pagination.hasPrev || isLoading}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Previous Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page Input */}
            <div className="flex items-center gap-2 text-sm">
              <span>Page</span>
              <input
                type="number"
                min="1"
                max={pagination.totalPages}
                value={inputPage}
                onChange={(e) => setInputPage(e.target.value)}
                onKeyDown={handlePageInput}
                onBlur={handlePageInputBlur}
                className="w-16 px-2 py-1 text-center border rounded"
                disabled={isLoading}
              />
              <span>of {pagination.totalPages}</span>
            </div>

            {/* Next Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNext || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Last Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.totalPages)}
              disabled={!pagination.hasNext || isLoading}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}