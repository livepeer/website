// Metadata files cascade, so without this the segment would serve its own
// og:image but the root's twitter:image. generateStaticParams comes with it.
export {
  default,
  alt,
  size,
  contentType,
  generateStaticParams,
} from "./opengraph-image";
