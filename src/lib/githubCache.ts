// src/lib/githubCache.ts
const githubCache = new Map<string, any>();

/**
 * Fetch repository data from GitHub API with an in-memory cache.
 * Supports both "owner/repo" format and full GitHub URLs.
 */
export async function fetchRepoData(repo: string) {
  // Normalize Repo name as the Cache Key
  let normalizedRepo = repo.toLowerCase().trim();
  
  if (normalizedRepo.startsWith("http")) {
    try {
      const url = new URL(normalizedRepo);
      // Extract "owner/repo" from the URL path, removing leading slashes
      normalizedRepo = url.pathname.replace(/^\/+/, "").replace(/\/$/, "");
    } catch (error) {
      console.warn(`[GitHub Cache] Invalid URL provided: ${repo}`);
      return null;
    }
  }

  // Return cached data if available to save API quota
  if (githubCache.has(normalizedRepo)) {
    return githubCache.get(normalizedRepo);
  }

  const token = import.meta.env.GITHUB_TOKEN;
  
  // Warning: GitHub heavily limits unauthenticated requests
  if (!token) {
    console.warn(`[GitHub Cache] No GITHUB_TOKEN found. API rate limits will be very low.`);
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${normalizedRepo}`,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "User-Agent": "SHBlog-Next-Client",
          "Accept": "application/vnd.github.v3+json",
        },
      },
    );

    if (!response.ok) {
      if (response.status === 403) {
        console.error(`[GitHub API] Rate limit exceeded or Forbidden for: ${normalizedRepo}`);
      } else if (response.status === 404) {
        console.warn(`[GitHub API] Repo not found: ${normalizedRepo}`);
      }
      return null;
    }

    const data = await response.json();
    
    // Store in memory cache
    githubCache.set(normalizedRepo, data);
    return data;
  } catch (error) {
    console.error(`[GitHub Fetch] Failed to fetch repo ${repo}:`, error);
    return null;
  }
}