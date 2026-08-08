// Metadata files cascade, so without this the segment would serve its own
// og:image but the root's twitter:image.
export { default, alt, size, contentType, generateStaticParams } from "./opengraph-image";
