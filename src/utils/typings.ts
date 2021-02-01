export interface MinimalPackageJSON {
  name: string;
  workspaces?: string[] | { packages: string[]; nohoist: string[] };
}
export type Compiler = 'webpack' | 'tsc' | 'swc' | 'snowpack';
export type BuildMode = 'development' | 'production';

export interface CompilationDiagnostic {
  fileName: string;
  lineNumber: number;
  columnNumber: number;
  messages: string;
}
