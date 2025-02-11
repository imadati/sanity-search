import { SearchParams } from "./types";

export const highlightText = (text: null | string, highlight: string) => {
  if (!text) {
    return null;
  }
  const parts = text.split(new RegExp(`(${highlight})`, "gi"));
  return parts.map((part, index) =>
    part.toLowerCase() === highlight.toLowerCase() ? (
      <span className="bg-black text-white" key={index}>
        {part}
      </span>
    ) : (
      part
    )
  );
};

export const createSanitySearchQuery = ({
  documentType,
  documentFragment,
  searchableFields,
  searchTerm,
}: SearchParams) => {
  // Create search conditions for each searchable field
  const searchConditions = searchableFields.reduce((conditions, field) => {
    return conditions
      ? `${conditions} || pt::text(${field}) match $searchTerm`
      : `pt::text(${field}) match $searchTerm`;
  }, "");

  const SEARCH_QUERY = `
      *[_type == $documentType && !(_id in path("drafts.**")) && (${searchConditions})] ${documentFragment}
    `;

  return {
    query: SEARCH_QUERY,
    params: {
      documentType,
      searchTerm: `${searchTerm}*`,
    },
  };
};
