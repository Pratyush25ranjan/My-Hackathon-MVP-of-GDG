/**
 * Mock service for summarizing community discussions.
 *
 * This replaces the Next.js + Genkit server flow for frontend usage.
 * Safe for Vite, demos, and hackathons.
 */

export async function summarizeCommunityDiscussion({
  discussionText,
  communityName,
}) {
  // Simulate network + AI delay
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // Very lightweight "AI-like" summary
  return {
    summary: `Summary for ${communityName} Community:

• Students are actively discussing final-year projects and research ideas.
• Popular topics include Machine Learning, NLP, Blockchain, and Sustainable Engineering.
• Seniors are sharing advice about starting early, choosing meaningful topics, and collaborating effectively.
• There is strong engagement from first-year students seeking guidance and resources.

Overall, the discussion shows high academic engagement and collaboration across departments.`,
  };
}
