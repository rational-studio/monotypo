import { MPackage } from '../utils/MPackage';
import { BuildMode, Compiler } from '../utils/typings';

export interface Bundler {
  name: string;
  bundle(project: MPackage, mode: BuildMode): Promise<void>;
  watch(project: MPackage, mode: BuildMode): Promise<void>;
}
