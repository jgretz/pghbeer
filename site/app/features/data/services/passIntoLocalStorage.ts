export default <T>(key: string, data: T) => {
  const json = JSON.stringify(data);
  localStorage.setItem(key, json);

  return data;
};
