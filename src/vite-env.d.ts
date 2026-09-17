/// <reference types="vite/client" />

declare module '*.jsx' {
  const component: React.ComponentType<any>;
  export default component;
  export const CommandChatbot: React.ComponentType<any>;
}

declare interface Window {
  puter?: {
    ai?: {
      chat: (prompt: string) => Promise<any>;
    };
  };
}
