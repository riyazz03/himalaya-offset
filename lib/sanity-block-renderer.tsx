import React from 'react';

interface Block {
  _type: string;
  _key?: string;
  style?: string;
  children?: Array<{
    _type: string;
    _key?: string;
    text?: string;
    marks?: string[];
  }>;
  [key: string]: unknown;
}

export function renderBlockContent(blocks: unknown[] | unknown): React.ReactNode {
  if (!blocks) return null;

  const blockArray = Array.isArray(blocks) ? blocks : [blocks];

  return blockArray.map((block: unknown, index: number) => {
    const blockObj = block as Block;

    // Handle paragraph blocks
    if (blockObj._type === 'block') {
      const style = blockObj.style || 'normal';
      const children = blockObj.children || [];

      const textContent = children
        .map((child: any) => child.text || '')
        .join('');

      switch (style) {
        case 'h1':
          return <h1 key={blockObj._key || index}>{textContent}</h1>;
        case 'h2':
          return <h2 key={blockObj._key || index}>{textContent}</h2>;
        case 'h3':
          return <h3 key={blockObj._key || index}>{textContent}</h3>;
        case 'h4':
          return <h4 key={blockObj._key || index}>{textContent}</h4>;
        case 'blockquote':
          return <blockquote key={blockObj._key || index}>{textContent}</blockquote>;
        default:
          return <p key={blockObj._key || index}>{textContent}</p>;
      }
    }

    // Handle other block types if needed
    return null;
  });
}