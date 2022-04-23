export const openFile = (onFilesReceived: (fileList: FileList) => any, multiple: boolean, accept?: string) => {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  if (accept) input.setAttribute('accept', accept);
  input.setAttribute('multiple', multiple ? 'true' : 'false');
  input.click();
  input.onchange = () => {
    const files = input.files;
    onFilesReceived(files);
    input.remove();
  };
};
