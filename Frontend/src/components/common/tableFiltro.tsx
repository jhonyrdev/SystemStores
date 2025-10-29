import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@components/ui/dropdown-menu";
import React from "react";

interface TableFiltroOption {
  label: string;
  items: string[];
  onSelect?: (value: string) => void;
}

interface TableFiltroProps {
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  filterGroups?: TableFiltroOption[];
}

const TableFiltro = ({
  searchPlaceholder = "Buscar...",
  onSearch,
  filterGroups = [],
}: TableFiltroProps) => {
    const [search, setSearch] = React.useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    onSearch?.(value);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between mb-4">
      <Input
        placeholder={searchPlaceholder}
        value={search}
        onChange={handleSearch}
        className="w-full sm:max-w-sm"
      />

      <div className="flex flex-wrap gap-2">
        {filterGroups.map((group) => (
          <DropdownMenu key={group.label}>
            <DropdownMenuTrigger asChild>
              <Button className="border border-[#c89b06] rounded-md text-black bg-transparent hover:text-[#c89b06] hover:bg-transparent">{group.label}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {group.items.map((item) => (
                <DropdownMenuItem
                  key={item}
                  onClick={() => group.onSelect?.(item)}
                >
                  {item}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>
    </div>
  );
}
 
export default TableFiltro;