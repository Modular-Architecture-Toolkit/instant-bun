import type { SyncSubprocess } from 'bun'
import { exit } from 'process'
import { ulog } from '../utils/ulog'

export async function logStdOutput(proc: SyncSubprocess) {
  try {
    const stdout = await new Response(proc.stdout).text()
    const stderr = proc?.stderr?.toString().trim()

    if (stdout) {
      ulog(stdout)
    }

    if (stderr) {
      ulog(stderr)
    }

    return {
      stdout,
      stderr,
    }
  } catch (error) {
    console.error(error)
  }
}

type GHActions<Env extends object> = {
  branch: 'main' | 'release'
  eventName: 'push' | 'pull_request'
} & Omit<Env, 'branch' | 'eventName'>

export function createGitHubActionsFactory({
  sshRepoUrl,
}: {
  sshRepoUrl: string // for now just ssh based
}) {
  const actionsEnv = {
    eventName: Bun.env.GITHUB_EVENT_NAME,
    runNumber: Bun.env.GITHUB_RUN_NUMBER,
    branch: Bun.env.GITHUB_REF?.split('/')?.[2],
    actor: Bun.env.GITHUB_ACTOR,
    job: Bun.env.GITHUB_JOB,
    refType: Bun.env.GITHUB_REF_TYPE,
  } as const

  const gitCmd = async (commands: string[], log = true) => {
    const commandArray = ['git', ...commands]

    try {
      if (log) ulog(`Running command: ${commandArray.join(' ')}`)

      const proc = Bun.spawnSync(commandArray)

      const stdout = await new Response(proc.stdout).text()

      if (stdout.trim()) {
        ulog(stdout.trim())
      }

      const stderr = await new Response(proc.stderr).text()
      if (stderr.trim()) {
        console.error(stderr.trim())
      }
    } catch (error) {
      console.error(`Failed to run command: ${commandArray}:`, error)
      exit(1)
    }
  }

  const commitAndPush = async (commitMsg: string) => {
    ulog('*** Running git commands ***')

    // Use the SSH to set the remote URL with authentication
    await gitCmd(['remote', 'set-url', 'origin', sshRepoUrl])
    ulog('Configured GitHub User')
    await gitCmd(['config', 'user.name'])

    ulog('Configured GitHub Email')
    await gitCmd(['config', 'user.email'])

    await gitCmd(['add', '.'])
    await gitCmd(['commit', '-m', `[skip ci] ${commitMsg}`])
    await gitCmd(['push', 'origin', 'HEAD:main'])
  }

  const setupGitConfig = async (
    {
      githubEmail,
      githubUsername,
    }: {
      // optional username and email for the git config, but defaults to the github-actions bot
      githubUsername: string
      githubEmail: string
    } = {
      githubUsername: 'github-actions[bot]',
      githubEmail: '41898282+github-actions[bot]@users.noreply.github.com',
    }
  ) => {
    ulog('*** Configuring Git ***')

    // Configure user name and email
    ulog('Configuring GitHub User')
    await gitCmd(['config', '--global', 'user.name', githubUsername])

    ulog('Configured Git User: ', await gitCmd(['config', 'user.name']))

    ulog('Configuring GitHub Email')
    await gitCmd(['config', '--global', 'user.email', githubEmail])

    ulog('Configured Git Email: ', await gitCmd(['config', 'user.email']))
  }

  return {
    actionsEnv: actionsEnv as GHActions<typeof actionsEnv>,
    gitCmd,
    commitAndPush,
    setupGitConfig,
  }
}
