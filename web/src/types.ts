import { FormEvent } from "react";

export type Package = {
  name: string;
  version: string;
  dependencies?: number[];
};

export type FormValues = {
  name: string;
  version: string;
};

export type DepsTree = Record<number, Package>;

export type PackageResponse =
  | DepsTree
  | {
      error?: string;
    };

export type FetchState = {
  loading: boolean;
  data?: DepsTree;
  error?: string;
};

export interface FormSubmitEvent extends FormEvent<HTMLFormElement> {
  target: HTMLFormElement;
}
