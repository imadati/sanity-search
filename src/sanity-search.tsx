"use client";

import { useEffect, useRef, useState } from "react";

import { SanitySearchConfig, SearchResult } from "./types";
import { highlightText } from "./helpers";
import {
  DEFAULT_NO_RESULTS_TEXT,
  DEFAULT_SEARCH_PLACEHOLDER,
  DEFAULT_SEARCH_DEBOUNCE_DELAY,
  DEFAULT_MINIMUM_SEARCH_LENGTH,
} from "./constants";
import "./output.css";

export type SanitySearchProps = {
  config?: SanitySearchConfig;
  onSearch: (searchTerm: string) => Promise<SearchResult[]>;
  LinkComponent?: React.ComponentType<any> | "a";
};

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
        (behavior?.minimumSearchLength || DEFAULT_MINIMUM_SEARCH_LENGTH)
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
    }, behavior?.searchDebounceDelay || DEFAULT_SEARCH_DEBOUNCE_DELAY);

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
    <div className="sanity_search relative w-full md:w-80" ref={dropdownRef}>
      <div className="sanity_search__input_container relative flex items-center">
        <input
          className={`sanity_search__input w-full pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            ui?.searchIcon || ui?.loadingIcon ? "pl-10" : "pl-4"
          }`}
          onChange={handleInputChange}
          onClick={handleOpenSearchDropdown}
          onKeyDown={handleOpenSearchDropdown}
          placeholder={ui?.placeholder || DEFAULT_SEARCH_PLACEHOLDER}
          value={searchTerm}
        />
        <div className="sanity_search__icon_container absolute left-2 top-1/2 -translate-y-1/2">
          {isLoading ? ui?.loadingIcon : ui?.searchIcon}
        </div>
      </div>
      {!isLoading && isOpen && (
        <div className="sanity_search__dropdown absolute z-10 mt-1 w-full max-h-96 overflow-y-auto border border-neutral-200 bg-white text-black rounded-lg">
          {searchResults.length > 0 ? (
            searchResults.map((item, index) => (
              <LinkComponent
                className="sanity_search__result_item block p-4 border-b border-white/10 last:border-none hover:bg-neutral-50 transition-colors"
                href={item.href}
                key={index}
              >
                <h4 className="sanity_search__result_title mb-1 text-sm">
                  {ui?.isHighlightEnabled
                    ? highlightText(item.title, searchTerm)
                    : item.title}
                </h4>
                <p className="sanity_search__result_description line-clamp-2 text-xs text-neutral-700">
                  {ui?.isHighlightEnabled
                    ? highlightText(item.description, searchTerm)
                    : item.description}
                </p>
              </LinkComponent>
            ))
          ) : (
            <p className="sanity_search__no_results p-4 text-sm">
              {ui?.noResultsText || DEFAULT_NO_RESULTS_TEXT}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
