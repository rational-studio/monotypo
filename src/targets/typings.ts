import { MPackage } from '../utils/MPackage';
import { BuildMode, Compiler } from '../utils/typings';

export interface Target {
  name: string;
  build(project: MPackage, mode: BuildMode): Promise<void>;
}
