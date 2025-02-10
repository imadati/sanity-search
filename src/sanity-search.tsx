"use client";

import { useEffect, useRef, useState } from "react";

import { SanitySearchConfig, SearchResult } from "./types";
import { highlightText } from "./helpers";
import {
  NO_RESULTS_TEXT,
  SEARCH_PLACEHOLDER,
  SEARCH_DEBOUNCE_DELAY,
  MINIMUM_SEARCH_LENGTH,
} from "./constants";

export interface SanitySearchProps {
  config?: SanitySearchConfig;
  onSearch: (searchTerm: string) => Promise<SearchResult[]>;
  LinkComponent?: React.ComponentType<any> | "a";
}

export default function SanitySearch({
  config,
  onSearch,
  LinkComponent = "a",
}: SanitySearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const behavior = config?.behavior;
  const ui = config?.ui;
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setSearchResults([]);
    setIsOpen(false);
    const delayDebounceFn = setTimeout(async () => {
      if (
        searchTerm.length >=
        (behavior?.minimumSearchLength || MINIMUM_SEARCH_LENGTH)
      ) {
        setIsLoading(true);
        setIsOpen(true);
        const results = await onSearch(searchTerm);
        setSearchResults(results);
        setIsLoading(false);
      } else {
        setSearchResults([]);
        setIsOpen(false);
      }
    }, behavior?.searchDebounceDelay || SEARCH_DEBOUNCE_DELAY);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, behavior, onSearch]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.target.value);
  }

  function handleOpenSearchDropdown() {
    if (searchResults.length > 0) {
      setIsOpen(true);
    }
  }

  return (
    <div className="sanity-search relative w-full md:w-80" ref={dropdownRef}>
      <div className="sanity-search-input-container relative w-full">
        <input
          className="sanity-search-input w-full pr-4 pl-8 pl-2 border rounded-md"
          onChange={handleInputChange}
          onClick={handleOpenSearchDropdown}
          onKeyDown={handleOpenSearchDropdown}
          placeholder={ui.placeholder || SEARCH_PLACEHOLDER}
          type="text"
          value={searchTerm}
        />
        <div className="sanity-search-icon-container absolute inset-y-0 top-2 left-4 flex items-center pr-3 pointer-events-none">
          {isLoading ? ui.loadingIcon : ui.searchIcon}
        </div>
      </div>
      {!isLoading && isOpen && (
        <div className="sanity-search-dropdown absolute z-10 mt-1 max-h-96 w-full overflow-y-auto border border-neutral-200 bg-white text-black lg:right-0 lg:w-80">
          {searchResults.length > 0 ? (
            searchResults.map((item, index) => (
              <LinkComponent
                className="sanity-search-result-item block border-b border-white/10 p-4 transition-colors last:border-none hover:bg-neutral-50"
                href={item.href}
                key={index}
              >
                <h4 className="sanity-search-result-title mb-1 text-sm">
                  {ui.isHighlightEnabled
                    ? highlightText(item.title, searchTerm)
                    : item.title}
                </h4>
                <p className="sanity-search-result-description line-clamp-2 text-xs text-neutral-700">
                  {ui.isHighlightEnabled
                    ? highlightText(item.description, searchTerm)
                    : item.description}
                </p>
              </LinkComponent>
            ))
          ) : (
            <p className="sanity-search-no-results p-4 text-sm">
              {ui.noResultsText || NO_RESULTS_TEXT}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
