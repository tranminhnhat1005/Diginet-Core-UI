export default function expandToHashMap (value, keys) {
  return keys.reduce ((hashMap, key) => {
    hashMap[key] = value;
    return hashMap;
  }, {});
}
