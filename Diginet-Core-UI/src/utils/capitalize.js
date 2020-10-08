export default function capitalize (string) {
  if (typeof string !== 'string') {
    console.log (`${string} is not a string`);
  }

  return string.charAt (0).toUpperCase () + string.slice (1);
}
