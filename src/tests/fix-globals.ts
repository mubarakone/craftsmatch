// Add global type definitions for Jest
// This file makes TypeScript happy with jest globals

declare global {
  // eslint-disable-next-line no-var
  var jest: any;
  namespace NodeJS {
    interface Global {
      jest: any;
    }
  }
} 