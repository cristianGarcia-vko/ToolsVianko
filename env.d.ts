declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_K6_API_BASE_URL?: string;
    EXPO_PUBLIC_TOOLS_WEB_PORT?: string;
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
};
