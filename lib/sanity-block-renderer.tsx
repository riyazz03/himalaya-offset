import React from 'react';

interface Child {
  _type: string;
  _key?: string;
  text?: string;
  marks?: string[];
}

interface Block {
  _type: string;
  _key?: string;
  style?: string;
  children?: Child[];
  [key: string]: unknown;
}

/**
 * Apply inline marks (bold, italic, code, etc.) to text
 */
function renderInlineMarks(text: string, marks: string[] = []): React.ReactNode {
  if (!marks || marks.length === 0) {
    return text;
  }

  let content: React.ReactNode = text;

  // Apply marks in order
  marks.forEach((mark) => {
    switch (mark) {
      case 'strong':
        content = <strong>{content}</strong>;
        break;
      case 'em':
      case 'emphasis':
        content = <em>{content}</em>;
        break;
      case 'code':
        content = <code>{content}</code>;
        break;
      case 'underline':
        content = <u>{content}</u>;
        break;
      case 'strike-through':
      case 'strikethrough':
        content = <s>{content}</s>;
        break;
      default:
        // Unknown mark, leave as is
        break;
    }
  });

  return content;
}

/**
 * Render children with proper inline formatting
 */
function renderChildren(children: Child[] = []): React.ReactNode {
  return children.map((child: Child, index: number) => {
    const text = child.text || '';
    const marks = child.marks || [];

    if (!text) return null;

    return (
      <React.Fragment key={child._key || index}>
        {renderInlineMarks(text, marks)}
      </React.Fragment>
    );
  });
}

/**
 * Render Sanity portable text blocks
 * Properly handles inline marks, headings, and paragraphs
 */
export function renderBlockContent(blocks: unknown[] | unknown): React.ReactNode {
  if (!blocks) return null;

  const blockArray = Array.isArray(blocks) ? blocks : [blocks];

  return blockArray.map((block: unknown, index: number) => {
    const blockObj = block as Block;

    if (blockObj._type === 'block') {
      const style = blockObj.style || 'normal';
      const children = blockObj.children || [];

      // Render children with marks applied
      const content = renderChildren(children);

      switch (style) {
        case 'h1':
          return <h1 key={blockObj._key || index}>{content}</h1>;
        case 'h2':
          return <h2 key={blockObj._key || index}>{content}</h2>;
        case 'h3':
          return <h3 key={blockObj._key || index}>{content}</h3>;
        case 'h4':
          return <h4 key={blockObj._key || index}>{content}</h4>;
        case 'h5':
          return <h5 key={blockObj._key || index}>{content}</h5>;
        case 'h6':
          return <h6 key={blockObj._key || index}>{content}</h6>;
        case 'blockquote':
          return <blockquote key={blockObj._key || index}>{content}</blockquote>;
        default:
          return <p key={blockObj._key || index}>{content}</p>;
      }
    }

    return null;
  });
}