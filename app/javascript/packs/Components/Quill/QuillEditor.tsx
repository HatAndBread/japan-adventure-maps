import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import Delta from 'quill-delta';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import { toolbarOptions } from '../../../lib/QuillToolbarOptions';
import ImageResize from '@taoqf/quill-image-resize-module';
import { uploadToCloudinary } from '../../../lib/uploadToCloudinary';
import MyLoader from '../MyLoader';
Quill.register('modules/imageResize', ImageResize);

const QuillEditor = ({
  setInnerHTML,
  setDelta,
  editorBlank,
  startState,
  startStateDelta,
  focusOnStart,
  textAreaHeight,
  placeHolder,
}: {
  setInnerHTML?: React.Dispatch<React.SetStateAction<string>>;
  setDelta?: (any) => any;
  editorBlank?: boolean;
  startState?: string;
  startStateDelta?: string;
  focusOnStart?: boolean;
  textAreaHeight?: number;
  placeHolder?: string;
}) => {
  const editorRef = useRef<HTMLDivElement>();
  const [quill, setQuill] = useState<Quill>();
  const [uploadingImages, setUploadingImages] = useState(false);
  useEffect(() => {
    if (editorRef.current) {
      const q = new Quill(editorRef.current, {
        modules: {
          toolbar: toolbarOptions,
          imageResize: { modules: ['Resize'] },
        },
        placeholder: placeHolder || 'Add a comment',
        theme: 'snow',
      });
      q.getModule('toolbar').addHandler('image', (e) => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.setAttribute('multiple', 'true');
        input.click();
        input.onchange = async function () {
          const files = input.files;
          setUploadingImages(true);
          const urls = await uploadToCloudinary(files);
          const range = q.getSelection();
          urls.forEach((url) => q.insertEmbed(range.index, 'image', url));
          setUploadingImages(false);
        };
      });
      setQuill(q);
      if (focusOnStart) q.focus();
      q.on('editor-change', () => {
        if (setInnerHTML) setInnerHTML(q.root.innerHTML);
        if (setDelta) setDelta(JSON.stringify(q.getContents()));
      });
    }
  }, [editorRef]);
  useEffect(() => {
    if (editorBlank) {
      quill.setContents(new Delta());
    }
  }, [editorBlank]);
  useEffect(() => {
    let delta: Delta;
    if (startState && quill) {
      // @ts-ignore
      delta = quill.clipboard.convert(startState);
    } else if (startStateDelta && quill) {
      delta = new Delta(JSON.parse(startStateDelta));
    }
    if (delta) quill.setContents(delta, 'silent');
  }, [quill]);
  return (
    <div style={{ position: 'relative', backgroundColor: 'white', borderRadius: '6px' }}>
      {uploadingImages && (
        <div
          style={{
            pointerEvents: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <MyLoader />
        </div>
      )}
      <div ref={editorRef} style={{ minHeight: textAreaHeight ? `${textAreaHeight}px` : '100px' }}></div>
    </div>
  );
};
export default QuillEditor;
