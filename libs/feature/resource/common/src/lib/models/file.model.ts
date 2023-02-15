import { FileTypes } from "../enums/file-types";

export interface ResourceFile {
  oid: string;
  path: string;
  type: FileTypes;
  version: string;

  url: string;
  bundleUrl: string;
  downloadUrl: string;
  describeUrl: string;

  children?: ResourceFile[];
}
