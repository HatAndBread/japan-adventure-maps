import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import Delta from 'quill-delta';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';

const QuillDisplay = ({ delta }: { delta: Delta }) => {
  const displayRef = useRef<HTMLDivElement>();
  useEffect(() => {
    if (!displayRef.current) return;
    const q = new Quill(displayRef.current, {
      modules: {
        toolbar: false,
      },
      placeholder: 'Add a comment',
      theme: 'bubble',
    });
    q.disable();
    q.setContents(delta);
  }, [displayRef]);
  return <div ref={displayRef}></div>;
};

export default QuillDisplay;
