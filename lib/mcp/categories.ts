/**
 * Tool Categories Definition
 * 
 * Predefined categories for MCP tools with auto-categorization logic
 */

import type { ToolCategory, ToolCategoryType, MCPToolMetadata } from './types'

/**
 * Predefined tool categories
 */
export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    id: 'file_operations',
    name: 'File Operations',
    description: 'File reading, writing, and management',
    icon: '🗂️',
    color: '#3B82F6', // blue
  },
  {
    id: 'web_api',
    name: 'Web & API',
    description: 'Web scraping, HTTP requests, and API calls',
    icon: '🌐',
    color: '#10B981', // green
  },
  {
    id: 'database',
    name: 'Database',
    description: 'Database queries and operations',
    icon: '💾',
    color: '#8B5CF6', // purple
  },
  {
    id: 'system',
    name: 'System Tools',
    description: 'System operations and shell commands',
    icon: '🔧',
    color: '#F59E0B', // amber
  },
  {
    id: 'data_processing',
    name: 'Data Processing',
    description: 'Data transformation, parsing, and analysis',
    icon: '📊',
    color: '#06B6D4', // cyan
  },
  {
    id: 'ai_ml',
    name: 'AI & ML',
    description: 'AI models, machine learning, and embeddings',
    icon: '🤖',
    color: '#EC4899', // pink
  },
  {
    id: 'text_documents',
    name: 'Text & Documents',
    description: 'Text processing, document parsing, and generation',
    icon: '📝',
    color: '#6366F1', // indigo
  },
  {
    id: 'media_graphics',
    name: 'Media & Graphics',
    description: 'Image processing, video, and graphics',
    icon: '🎨',
    color: '#EF4444', // red
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Encryption, authentication, and security tools',
    icon: '🔒',
    color: '#14B8A6', // teal
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Metrics, monitoring, and analytics',
    icon: '📈',
    color: '#F97316', // orange
  },
  {
    id: 'other',
    name: 'Other',
    description: 'Miscellaneous tools',
    icon: '🔨',
    color: '#6B7280', // gray
  },
]

/**
 * Get category by ID
 */
export function getCategoryById(id: ToolCategoryType): ToolCategory | undefined {
  return TOOL_CATEGORIES.find((cat) => cat.id === id)
}

/**
 * Get category by name (case-insensitive)
 */
export function getCategoryByName(name: string): ToolCategory | undefined {
  const normalizedName = name.toLowerCase()
  return TOOL_CATEGORIES.find((cat) => cat.name.toLowerCase() === normalizedName)
}

/**
 * Auto-categorize a tool based on its name and description
 */
export function categorizeTool(tool: MCPToolMetadata): ToolCategoryType {
  const text = `${tool.name} ${tool.description}`.toLowerCase()

  // File operations keywords
  if (
    text.match(/\b(file|read|write|delete|create|directory|folder|path|fs|filesystem)\b/i)
  ) {
    return 'file_operations'
  }

  // Web & API keywords
  if (
    text.match(/\b(web|http|fetch|request|api|url|scrape|download|upload|rest|graphql)\b/i)
  ) {
    return 'web_api'
  }

  // Database keywords
  if (
    text.match(/\b(database|db|sql|query|table|schema|postgres|mysql|mongo|redis)\b/i)
  ) {
    return 'database'
  }

  // System keywords
  if (
    text.match(/\b(system|shell|command|exec|process|terminal|bash|script|env)\b/i)
  ) {
    return 'system'
  }

  // Data processing keywords
  if (
    text.match(/\b(data|parse|transform|convert|process|analyze|filter|sort|csv|json|xml)\b/i)
  ) {
    return 'data_processing'
  }

  // AI & ML keywords
  if (
    text.match(/\b(ai|ml|model|train|predict|embedding|neural|vector|openai|anthropic)\b/i)
  ) {
    return 'ai_ml'
  }

  // Text & Documents keywords
  if (
    text.match(/\b(text|document|doc|pdf|markdown|word|editor|format|template)\b/i)
  ) {
    return 'text_documents'
  }

  // Media & Graphics keywords
  if (
    text.match(/\b(image|video|audio|media|graphic|photo|picture|render|draw)\b/i)
  ) {
    return 'media_graphics'
  }

  // Security keywords
  if (
    text.match(/\b(security|encrypt|decrypt|auth|token|password|key|certificate|ssl)\b/i)
  ) {
    return 'security'
  }

  // Analytics keywords
  if (
    text.match(/\b(analytics|metric|monitor|log|track|stats|report|dashboard)\b/i)
  ) {
    return 'analytics'
  }

  // Default to 'other'
  return 'other'
}

/**
 * Categorize multiple tools
 */
export function categorizeTools(
  tools: MCPToolMetadata[]
): Map<ToolCategoryType, MCPToolMetadata[]> {
  const categorized = new Map<ToolCategoryType, MCPToolMetadata[]>()

  // Initialize with empty arrays
  TOOL_CATEGORIES.forEach((cat) => {
    categorized.set(cat.id, [])
  })

  // Categorize each tool
  tools.forEach((tool) => {
    const category = categorizeTool(tool)
    const existing = categorized.get(category) || []
    existing.push(tool)
    categorized.set(category, existing)
  })

  return categorized
}

/**
 * Get category distribution statistics
 */
export function getCategoryDistribution(
  tools: MCPToolMetadata[]
): Record<ToolCategoryType, number> {
  const distribution: Record<string, number> = {}

  // Initialize all categories with 0
  TOOL_CATEGORIES.forEach((cat) => {
    distribution[cat.id] = 0
  })

  // Count tools in each category
  tools.forEach((tool) => {
    const category = categorizeTool(tool)
    distribution[category] = (distribution[category] || 0) + 1
  })

  return distribution as Record<ToolCategoryType, number>
}

/**
 * Filter tools by category
 */
export function filterToolsByCategory(
  tools: MCPToolMetadata[],
  category: ToolCategoryType
): MCPToolMetadata[] {
  return tools.filter((tool) => categorizeTool(tool) === category)
}

/**
 * Search tools across categories
 */
export function searchTools(tools: MCPToolMetadata[], query: string): MCPToolMetadata[] {
  const normalizedQuery = query.toLowerCase().trim()

  if (!normalizedQuery) {
    return tools
  }

  return tools.filter((tool) => {
    const text = `${tool.name} ${tool.description}`.toLowerCase()
    return text.includes(normalizedQuery)
  })
}

/**
 * Get popular categories (by tool count)
 */
export function getPopularCategories(
  tools: MCPToolMetadata[],
  limit: number = 5
): Array<{ category: ToolCategory; count: number }> {
  const distribution = getCategoryDistribution(tools)

  return Object.entries(distribution)
    .map(([id, count]) => ({
      category: getCategoryById(id as ToolCategoryType)!,
      count,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}
