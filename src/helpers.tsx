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
