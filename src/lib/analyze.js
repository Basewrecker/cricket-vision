/*
 * analyze.js — Session-level aggregation of pose analysis results.
 * Exports: summarizeSession(frames, poseResults) → SessionSummary
 *
 * SessionSummary = {
 *   avgScore:   number,   // average overallScore across valid results, rounded
 *   goodFrames: number,   // count of results with overallScore >= 67
 *   topIssues:  string[]  // up to 3 most frequent issue names ('frontArm'|'head'|'release')
 * }
 *
 * Assumptions:
 *  - poseResults is an Array that may contain null entries (frames where no pose was detected)
 *  - frames param is accepted for API symmetry but aggregation is driven by poseResults
 */

/*
 * PSEUDO-TESTS
 *
 * summarizeSession([], []) → { avgScore: 0, goodFrames: 0, topIssues: [] }
 * summarizeSession(frames, [null, null]) → { avgScore: 0, goodFrames: 0, topIssues: [] }
 *
 * summarizeSession(frames, [{ overallScore: 100, frontArm: 'good', head: 'good', release: 'good' }])
 *   → { avgScore: 100, goodFrames: 1, topIssues: [] }
 *
 * summarizeSession(frames, [
 *   { overallScore: 0, frontArm: 'bad', head: 'bad', release: 'bad' },
 *   { overallScore: 0, frontArm: 'bad', head: 'warn', release: 'bad' },
 *   { overallScore: 33, frontArm: 'bad', head: 'good', release: 'warn' },
 * ])
 *   → topIssues: ['frontArm', 'release', 'head']  (frontArm: 3, release: 2, head: 2 — tie broken by Object.entries order)
 *
 * goodFrames counts results where overallScore >= 67 (not > 67)
 *
 * topIssues only includes issues that appeared at least once
 */

export function summarizeSession(frames, poseResults) {
  const valid = poseResults.filter((r) => r != null)

  if (valid.length === 0) {
    return { avgScore: 0, goodFrames: 0, topIssues: [] }
  }

  const avgScore = Math.round(
    valid.reduce((sum, r) => sum + r.overallScore, 0) / valid.length
  )

  const goodFrames = valid.filter((r) => r.overallScore >= 67).length

  const issueCount = {}
  for (const r of valid) {
    if (r.frontArm !== 'good') issueCount.frontArm = (issueCount.frontArm || 0) + 1
    if (r.head !== 'good') issueCount.head = (issueCount.head || 0) + 1
    if (r.release !== 'good') issueCount.release = (issueCount.release || 0) + 1
  }

  const topIssues = Object.entries(issueCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name)

  return { avgScore, goodFrames, topIssues }
}
