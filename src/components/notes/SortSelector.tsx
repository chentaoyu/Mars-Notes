"use client";

import { ArrowDownAZ, ArrowUpAZ, Calendar, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NoteSortBy, NoteSortOrder } from "@/types";

interface SortSelectorProps {
  sortBy: NoteSortBy;
  sortOrder: NoteSortOrder;
  onSortChange: (sortBy: NoteSortBy, sortOrder: NoteSortOrder) => void;
}

export function SortSelector({ sortBy, sortOrder, onSortChange }: SortSelectorProps) {
  const currentValue = `${sortBy}-${sortOrder}`;

  const handleValueChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split("-") as [NoteSortBy, NoteSortOrder];
    onSortChange(newSortBy, newSortOrder);
  };

  const getSortIcon = () => {
    if (sortBy === "title") {
      return sortOrder === "asc" ? (
        <ArrowDownAZ className="h-3 w-3 sm:h-4 sm:w-4" />
      ) : (
        <ArrowUpAZ className="h-3 w-3 sm:h-4 sm:w-4" />
      );
    }
    return sortOrder === "desc" ? (
      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
    ) : (
      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
    );
  };

  const getSortLabel = () => {
    const labels: Record<string, string> = {
      "updatedAt-desc": "最近更新",
      "updatedAt-asc": "最早更新",
      "createdAt-desc": "最新创建",
      "createdAt-asc": "最早创建",
      "title-asc": "标题 A-Z",
      "title-desc": "标题 Z-A",
    };
    return labels[currentValue] || "排序";
  };

  return (
    <Select value={currentValue} onValueChange={handleValueChange}>
      <SelectTrigger className="w-full sm:w-[180px]">
        <div className="flex items-center gap-1 sm:gap-2">
          {getSortIcon()}
          <SelectValue placeholder="选择排序方式" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel className="text-xs sm:text-sm">按更新时间</SelectLabel>
          <SelectItem value="updatedAt-desc" className="text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>最近更新</span>
            </div>
          </SelectItem>
          <SelectItem value="updatedAt-asc" className="text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 opacity-50" />
              <span>最早更新</span>
            </div>
          </SelectItem>
        </SelectGroup>

        <SelectSeparator />

        <SelectGroup>
          <SelectLabel className="text-xs sm:text-sm">按创建时间</SelectLabel>
          <SelectItem value="createdAt-desc" className="text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>最新创建</span>
            </div>
          </SelectItem>
          <SelectItem value="createdAt-asc" className="text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 opacity-50" />
              <span>最早创建</span>
            </div>
          </SelectItem>
        </SelectGroup>

        <SelectSeparator />

        <SelectGroup>
          <SelectLabel className="text-xs sm:text-sm">按标题</SelectLabel>
          <SelectItem value="title-asc" className="text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <ArrowDownAZ className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>标题 A-Z</span>
            </div>
          </SelectItem>
          <SelectItem value="title-desc" className="text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <ArrowUpAZ className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>标题 Z-A</span>
            </div>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
