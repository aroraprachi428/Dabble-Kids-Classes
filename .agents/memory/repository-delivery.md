---
name: Repository delivery
description: User constraints for GitHub demo placement and a source-control authorization quirk.
---

Keep the README and demo video in the existing application GitHub repository. Do not create a separate video repository or a video-specific folder hierarchy.

**Why:** The user explicitly required the demo video and README to stay in the same repository without a separate folder hierarchy.

**How to apply:** Place compact demo exports alongside the root README; preserve that arrangement when refreshing the demo.

For outbound repository synchronization, treat the local workspace as the source of truth. Do not pull or merge remote changes as part of the push unless the user changes this instruction.

**Why:** The user explicitly prohibited pulling and requested that GitHub match the local version.

**How to apply:** Inspect remote refs without importing changes. Distinguish fast-forward updates from destructive history replacement and explain any overwrite before doing it.

The Git command-line connection can reject pushes even when its integration reports healthy; the separately connected GitHub App API may still support authenticated writes.

**Why:** Attaching the source-control connection and retrying Git did not repair its authorization, while the GitHub App API successfully transferred an identical commit.

**How to apply:** When using the Git data API as an alternative transport, preserve tree, parent, message, author, committer, and timestamps. Verify the created commit hash equals local HEAD before moving the remote branch, and use a non-forced ref update whenever possible.
