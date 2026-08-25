export function filledKey(value?: string): boolean {
  return (value?.trim().length ?? 0) > 8
}

export function hasLiveModel(): boolean {
  return (
    filledKey(process.env.OPENAI_API_KEY) ||
    filledKey(process.env.ANTHROPIC_API_KEY) ||
    filledKey(process.env.GOOGLE_GENERATIVE_AI_API_KEY) ||
    filledKey(process.env.GROQ_API_KEY)
  )
}

export function hasBuffer(): boolean {
  return filledKey(process.env.BUFFER_ACCESS_TOKEN)
}
