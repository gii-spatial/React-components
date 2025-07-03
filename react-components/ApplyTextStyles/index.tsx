import { type ReactElement } from "react";

export type HighlightRule = {
  /** String that matches a specific word in the `fullText` */
  partialText?: string;
  /**
   * TODO: For improvement
   * Classname to apply.
   * For now, it might be best not to assign multiple classnames
   */
  className: string;
};

export interface ApplyTextStylesProps {
  /** Full text to process */
  fullText: string;
  highlights: HighlightRule[];
}

export function ApplyTextStyles(props: ApplyTextStylesProps): ReactElement {
  const { fullText, highlights } = props;

  const matches: { start: number; end: number; className: string }[] = [];

  highlights.forEach(({ partialText, className }) => {
    /**
     * ❌ Skip process when:
     *   a. partialText is undefined or null — no text to highlight
     *   b. className is an empty string — evaluate to invalid
     */
    if (partialText === undefined || className === "") return;

    /**
     * ⚠️ NOTE: -- RegExp --
     * Escape special characters.
     * This can have side effects especially when string contains special characters.
     */
    const escaped = partialText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "g");

    let match = regex.exec(fullText);
    while (match !== null) {
      /**
       * start - index where the match starts in fullText
       * end - index where the match ends (start + length of partialText)
       * className -  the CSS class name to apply for highlighting
       */
      matches.push({
        start: match.index,
        end: match.index + partialText.length,
        className,
      });

      // Continue searching for next match from last match position
      match = regex.exec(fullText);
    }
  });

  /**
   * 😀 Sort the matches[] just to ensure
   * everthing is in the right order lol.
   */
  matches.sort((a, b) => a.start - b.start);

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;

  matches.forEach(({ start, end, className }, i) => {
    /**
     * If there is any non-highlighted text before the current match,
     * just add it as plain text.
     */
    if (start > lastIndex) nodes.push(fullText.slice(lastIndex, start));

    /**
     * Process flow:
     * 1. Extract the matched substring that we compute earlier
     * 2. Add a span and append a className
     *    - the className should let the consumer component decide the style of the text
     */
    const highlightedText = fullText.slice(start, end);
    nodes.push(
      <span key={i} className={className}>
        {highlightedText}
      </span>
    );

    // Update lastIndex to the end of the current match
    lastIndex = end;
  });

  /**
   * If any remaining non-highlighted text exists,
   * just add it.
   */
  if (lastIndex < fullText.length) nodes.push(fullText.slice(lastIndex));

  return <>{nodes}</>;
}
