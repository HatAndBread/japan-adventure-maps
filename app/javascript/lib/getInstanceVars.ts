import { camelize } from './camelize';
export const getInstanceVars = () => {
  const data: any = document.getElementsByName('react-data');
  if (!data || !data[0] || !data[0].content) return;
  return camelize(JSON.parse(data[0].content) || {});
};
