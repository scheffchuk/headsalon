import React from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

type SearchInputProps = {
  query: string;
  onChange: (value: string) => void;
  onClear: () => void;
  isLoading: boolean;
};

export function SearchInput({ query, onChange, onClear, isLoading }: SearchInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handlePrefixClick = () => {
    inputRef.current?.focus();
  };

  const handleSuffixClick = () => {
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="relative">
      <button
        type="button"
        onClick={handlePrefixClick}
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-auto z-10"
        aria-label="Focus search input"
      >
        <Search className="h-4 w-4 pointer-events-none" />
      </button>
      <Input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="你感兴趣的主题..."
        className="pl-10 pr-10 text-base md:text-sm"
        autoComplete="off"
        spellCheck={false}
        required={false}
      />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-auto z-10">
        {isLoading ? (
          <div className="pointer-events-none">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              onClear();
              handleSuffixClick();
            }}
            className="text-muted-foreground hover:text-foreground select-none"
            aria-label="Clear search"
          >
            <X className="h-4 w-4 pointer-events-none" />
          </button>
        ) : null}
      </div>
    </form>
  );
}