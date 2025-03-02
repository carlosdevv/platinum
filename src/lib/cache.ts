import NodeCache from "node-cache";

const cache = new NodeCache({
  stdTTL: 3600, // significado: tempo de vida do cache em segundos (1 hora)
  checkperiod: 3600 / 2, // significado: tempo de verificação do cache em segundos (30 minutos)
});

export const getCachedData = (key: string) => {
  return cache.get(key);
};

export const setCachedData = (key: string, value: any) => {
  cache.set(key, value);
};
