import {
  AutoMode,
  CropMode,
  FitMode,
  ImageFormat,
  ImageUrlBuilderOptions,
  ImageUrlBuilderOptionsWithAliases,
  Orientation,
  SanityClientLike,
  SanityImageSource,
  SanityProjectDetails,
} from './types'
export default function urlBuilder(
  options?: SanityClientLike | SanityProjectDetails
): ImageUrlBuilder
export declare class ImageUrlBuilder {
  options: ImageUrlBuilderOptions
  constructor(parent: ImageUrlBuilder | null, options: ImageUrlBuilderOptions)
  withOptions(options: Partial<ImageUrlBuilderOptionsWithAliases>): ImageUrlBuilder
  image(source: SanityImageSource): ImageUrlBuilder
  dataset(dataset: string): ImageUrlBuilder
  projectId(projectId: string): ImageUrlBuilder
  bg(bg: string): ImageUrlBuilder
  dpr(dpr: number): ImageUrlBuilder
  width(width: number): ImageUrlBuilder
  height(height: number): ImageUrlBuilder
  focalPoint(x: number, y: number): ImageUrlBuilder
  maxWidth(maxWidth: number): ImageUrlBuilder
  minWidth(minWidth: number): ImageUrlBuilder
  maxHeight(maxHeight: number): ImageUrlBuilder
  minHeight(minHeight: number): ImageUrlBuilder
  size(width: number, height: number): ImageUrlBuilder
  blur(blur: number): ImageUrlBuilder
  sharpen(sharpen: number): ImageUrlBuilder
  rect(left: number, top: number, width: number, height: number): ImageUrlBuilder
  format(format: ImageFormat): ImageUrlBuilder
  invert(invert: boolean): ImageUrlBuilder
  orientation(orientation: Orientation): ImageUrlBuilder
  quality(quality: number): ImageUrlBuilder
  forceDownload(download: boolean | string): ImageUrlBuilder
  flipHorizontal(): ImageUrlBuilder
  flipVertical(): ImageUrlBuilder
  ignoreImageParams(): ImageUrlBuilder
  fit(value: FitMode): ImageUrlBuilder
  crop(value: CropMode): ImageUrlBuilder
  saturation(saturation: number): ImageUrlBuilder
  auto(value: AutoMode): ImageUrlBuilder
  pad(pad: number): ImageUrlBuilder
  url(): string | null
  toString(): string | null
}