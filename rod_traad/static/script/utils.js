export function areArraysEqual(arr1, arr2) {
  return (
    arr1.length === arr2.length && arr1.every((word) => arr2.includes(word))
  );
}
