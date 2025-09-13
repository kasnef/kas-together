// Add your custom type definitions here

interface ImportMetaEnv {
  readonly NEXT_PUBLIC_DEV_API_URL: string;
  // add other env variables if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}