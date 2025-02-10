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
    <div className="sanity_search" ref={dropdownRef}>
      <div className="sanity_search__input_container">
        <input
          className="sanity_search__input"
          onChange={handleInputChange}
          onClick={handleOpenSearchDropdown}
          onKeyDown={handleOpenSearchDropdown}
          placeholder={ui.placeholder || SEARCH_PLACEHOLDER}
          type="text"
          value={searchTerm}
        />
        <div className="sanity_search__icon_container">
          {isLoading ? ui.loadingIcon : ui.searchIcon}
        </div>
      </div>
      {!isLoading && isOpen && (
        <div className="sanity_search__dropdown">
          {searchResults.length > 0 ? (
            searchResults.map((item, index) => (
              <LinkComponent
                className="sanity_search__result_item"
                href={item.href}
                key={index}
              >
                <h4 className="sanity_search__result_title">
                  {ui.isHighlightEnabled
                    ? highlightText(item.title, searchTerm)
                    : item.title}
                </h4>
                <p className="sanity_search__result_description">
                  {ui.isHighlightEnabled
                    ? highlightText(item.description, searchTerm)
                    : item.description}
                </p>
              </LinkComponent>
            ))
          ) : (
            <p className="sanity_search__no_results">
              {ui.noResultsText || NO_RESULTS_TEXT}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
