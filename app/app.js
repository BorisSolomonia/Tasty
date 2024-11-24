import { Application } from '@nativescript/core';
import { initializeStore } from './store';

// Initialize the store
initializeStore();

Application.run({ moduleName: 'app-root' });