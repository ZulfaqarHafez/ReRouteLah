import { Search, Mic, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

const SearchBar = ({ onSearch, placeholder = "Where do you want to go?" }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      onSearch(query.trim());
    }
  };

  const clearQuery = () => {
    setQuery("");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`
          flex items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-md
          transition-all duration-200
          ${isFocused ? "ring-2 ring-primary shadow-lg" : ""}
        `}
      >
        <Search className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-lg text-foreground placeholder:text-muted-foreground focus:outline-none"
        />

        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clearQuery}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        <Button
          type="button"
          variant="soft"
          size="icon"
          className="h-10 w-10 flex-shrink-0"
          aria-label="Voice search"
        >
          <Mic className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;
