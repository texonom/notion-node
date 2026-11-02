/** The token an export runs with: the flag when given, which other processes can read, otherwise NOTION_TOKEN. */
export function exportToken(flag: string | undefined, env: NodeJS.ProcessEnv = process.env) {
  if (flag)
    return {
      token: flag,
      warning: '--token is visible to other processes and kept in shell history; set NOTION_TOKEN instead'
    }
  return { token: env.NOTION_TOKEN || undefined }
}
