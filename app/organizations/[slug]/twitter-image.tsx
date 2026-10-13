// Metadata files cascade, so without this the segment would serve its own
// og:image but the root's twitter:image. generateStaticParams comes with it —
// without that re-export the card is generated on demand rather than at build.
export {
  default,
  alt,
  size,
  contentType,
  generateStaticParams,
} from "./opengraph-image";
