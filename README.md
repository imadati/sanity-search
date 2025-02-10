# Sanity Search Component

A **lightweight** and **configurable** search component for **Sanity.io** and **Next.js** websites, built with **React** and **TypeScript**.

## ✨ Features

- 🔍 **Instant Search** with **Debouncing**
- 🔥 **Highlight Matched Keywords**
- 🎨 **Customizable UI & Icons**
- ⚡ **Pluggable Search Query Generator**

## 🚀 Installation

```sh
npm install sanity-search
# or
yarn add sanity-search
```

## 🛠 Usage

### Basic Implementation

First, create a server action that returns a list of search results.

```tsx
// actions/search.ts
"use server";
import { createSanitySearchQuery } from "sanity-search";

const MINIMUM_SEARCH_LENGTH = 2;

export default async function search(searchTerm: string) {
  if (!searchTerm || searchTerm.length < MINIMUM_SEARCH_LENGTH) {
    return [];
  }

  try {
    const { query, params } = createSanitySearchQuery({
      documentFragment: `{
        title,
        description,
        body,
        "href": slug.current
      }`,
      documentType: "blog.post",
      searchTerm,
      searchableFields: ["title", "description", "body"],
    });

    const data = await loadQuery<any[]>({
      params,
      query,
    });

    if (!data) {
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error searching blog posts:", error);
    return [];
  }
}
```

Then, use the `SanitySearch` component in your search component, passing in the search server action.

```tsx
// components/search.tsx
"use client";

import Link from "next/link";
import { SanitySearch } from "sanity-search";

import search from "../actions/search";

export default function Search() {
  return (
    <SanitySearch 
      config={{
        behavior: {
          searchDebounceDelay: 500,
          minimumSearchLength: 2,
        },
        ui: {
          placeholder: "Search",
          noResultsText: "No results found. Please try a different search.",
          searchIcon: "🔍",
          loadingIcon: "⏳",
        },
      }} 
      onSearch={search}
      LinkComponent={Link}
    />
  );
}
```

## 📌 Props

### `<SanitySearch />`

| Prop           | Type                                      | Required | Description |
|---------------|-----------------------------------------|----------|-------------|
| `config`      | `SanitySearchConfig`                    | ✅        | Search behavior & UI config |
| `onSearch`    | `(searchTerm: string) => Promise<SearchResult[]>` | ✅ | Function to fetch search results |
| `className`   | `string`                                | ❌        | Custom class for styling |
| `LinkComponent` | `React.ComponentType | ❌ | Custom link component |

### `SanitySearchConfig`

| Property               | Type            | Default | Description |
|------------------------|----------------|---------|-------------|
| `behavior.searchDebounceDelay` | `number` | `500` | Delay before search triggers |
| `behavior.minimumSearchLength` | `number` | `2` | Min. characters to start searching |
| `ui.placeholder` | `string` | `"Search"` | Input placeholder text |
| `ui.noResultsText` | `string` | `"No results found. Please try a different search."` | Text when no results |
| `ui.searchIcon` | `React.ReactNode` | null | Custom search icon |
| `ui.loadingIcon` | `React.ReactNode` | null | Custom loading icon |
| `ui.isHighlightEnabled` | `boolean` | `true` | Highlight search matches |

## 🔗 API Helpers

### `createSanitySearchQuery`
Generates a structured **GROQ query** to fetch data from **Sanity.io** and returns the query and params.

```ts
const {query, params} = createSanitySearchQuery({
  documentType: "post",
  documentFragment: "{ title, description, body, href }",
  searchableFields: ["title", "description", "body"],
  searchTerm: "example",
});
```

## 🎨 Styling
You can customize the component using classes, here is a list of classes you can use:

- `sanity_search`
- `sanity_search__input_container`
- `sanity_search__input`
- `sanity_search__icon_container`
- `sanity_search__dropdown`
- `sanity_search__result_item`
- `sanity_search__result_title`
- `sanity_search__result_description`
- `sanity_search__no_results`


## 📜 License
MIT License © 2025 Imad Attif

## 🌟 Contributions
PRs and feedback are welcome! 🚀

