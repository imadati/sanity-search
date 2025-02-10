import { SearchParams } from "../types";

export function createSanitySearchQuery({
  documentType,
  documentFragment,
  searchableFields,
  searchTerm,
}: SearchParams) {
  // Create search conditions for each searchable field
  const searchConditions = searchableFields
    .map((field) => {
      if (field === "body") {
        return `pt::text(${field}) match $searchTerm`;
      }
      return `${field} match $searchTerm`;
    })
    .join(" || ");

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
}
