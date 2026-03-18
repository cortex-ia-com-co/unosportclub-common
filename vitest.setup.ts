/**
 * Angular unit test environment for Vitest.
 * - Load JIT compiler so injectables (e.g. PlatformLocation) can be compiled.
 * - Init TestBed with BrowserDynamicTestingModule.
 */
import '@angular/compiler';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);
