import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

type SearchInputProps = {
  query: string;
  onChange: (value: string) => void;
  onClear: () => void;
  isLoading: boolean;
};

export function SearchInput({ query, onChange, onClear, isLoading }: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        type="search"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="你感兴趣的主题..."
        className="pl-10 pr-10 text-base md:text-sm"
      />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : query ? (
          <button
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}