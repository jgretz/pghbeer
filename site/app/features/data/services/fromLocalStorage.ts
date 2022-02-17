export default <T>(key: string, notFound: T) => {
  const json = localStorage.getItem(key);
  if (json) {
    return JSON.parse(json) as T;
  }

  return notFound;
};
