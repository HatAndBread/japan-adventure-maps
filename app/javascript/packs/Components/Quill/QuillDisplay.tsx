import React, { useEffect, useRef } from 'react';
import Quill  from 'quill';
import Delta from 'quill-delta';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';

const QuillDisplay = ({ delta, html, placeholder }: { delta?: Delta, html?: string, placeholder?: string }) => {
  const displayRef = useRef<HTMLDivElement>();
  useEffect(() => {
    if (!delta) return;
    if (!displayRef.current) return;
    const q = new Quill(displayRef.current, {
      modules: {
        toolbar: false,
      },
      placeholder,
      theme: 'bubble',
    });
    q.disable();
    q.setContents(delta);
  }, [displayRef, delta]);
  useEffect(() => {
    if (!html) return;
    if (!displayRef.current) return;
    const q = new Quill(displayRef.current, {
      modules: {
        toolbar: false,
      },
      placeholder,
      theme: 'bubble',
    });
    q.disable();
    q.clipboard.dangerouslyPasteHTML(html);
  }, [displayRef, html]);
  return <div ref={displayRef}></div>;
};

export default QuillDisplay;
