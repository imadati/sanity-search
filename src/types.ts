export type SearchResult = {
  title: string;
  description: string;
  href: string;
};

export type SanityQueryLoaderParams = {
  params?: Record<string, unknown>;
  query: string;
};

export type SanityQueryLoader<T = SearchResult> = (
  params: SanityQueryLoaderParams
) => Promise<T[]>;

export type SanitySearchConfig = {
  behavior?: {
    searchDebounceDelay?: number;
    minimumSearchLength?: number;
  };
  ui?: {
    placeholder?: string;
    noResultsText?: string;
    searchIcon?: React.ReactNode;
    loadingIcon?: React.ReactNode;
    isHighlightEnabled?: boolean;
  };
};

export type SearchParams = {
  searchTerm: string;
  minimumSearchLength?: number;
  documentType: string;
  documentFragment: string;
  searchableFields: string[];
};
