/**
 * Sidebar Component - Backward Compatibility Wrapper
 * 
 * This file maintains backward compatibility for existing imports.
 * All sidebar components have been refactored into modular files:
 * - components/ui/sidebar/context.ts - Context and hooks
 * - components/ui/sidebar/provider.tsx - Provider component
 * - components/ui/sidebar/sidebar.tsx - Main sidebar components
 * - components/ui/sidebar/sections.tsx - Header, Footer, Content, etc.
 * - components/ui/sidebar/group.tsx - Group components
 * - components/ui/sidebar/menu.tsx - Menu components
 * - components/ui/sidebar/types.ts - TypeScript types
 * - components/ui/sidebar/constants.ts - Configuration constants
 * 
 * For new code, consider importing directly from the modular structure.
 */

export * from "./sidebar/index"
