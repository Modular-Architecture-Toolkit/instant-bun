import Bun from 'bun'
import path from 'path'
import { exit } from 'process'
// import * as u from "./";
import { deploy, npm } from 'index'
import { ulog } from './packages/utils/ulog'

// run bun test
const testProc = Bun.spawnSync(['bun', 'test', '--coverage'], {})

const output = await deploy.logStdOutput(testProc)

if (!output) {
  ulog('No output')
  exit(1)
}

const NPM_TOKEN = Bun.env.NPM_TOKEN || ''
const MAX_RETRIES = Number(Bun.env.MAX_PUBLISH_RETRY) || 10 // Define a max number of retries to prevent infinite loops

const e = Bun.env

const { commitAndPush, setupGitConfig, actionsEnv } = deploy.createGitHubActionsFactory({
  sshRepoUrl: 'git@github.com:brandon-schabel/bun-nook-kit.git',
})

const isBeta = actionsEnv.branch === 'main'
const isRelease = actionsEnv.branch === 'release'
const isAlpha = actionsEnv.eventName === 'pull_request'
const isLocalRun = Bun.env.LOCAL_RUN === 'true'

const { npmPublish, setupNpmAuth, updatePackageVersion } = npm.npmReleaseFactory({
  maxRetries: MAX_RETRIES,
  npmToken: NPM_TOKEN,
})

const corePackagePath = path.resolve(process.cwd(), 'package.json')


ulog({
  actor: e?.GITHUB_ACTOR,
  job: e?.GITHUB_JOB,
  refType: e?.GITHUB_REF_TYPE,
  runner: e?.RUNNER_NAME,
  gitHubAction: e.GITHUB_ACTION,
  runNumber: e.GITHUB_RUN_NUMBER,
  runnerEnv: e?.RUNNNER_ENVIRONMENT,
  eventName: e?.GITHUB_EVENT_NAME,
  isLocalRun,
  isAlpha,
  corePackagePath,
})

/* Script */
if (!isLocalRun) {
  setupNpmAuth()
  await setupGitConfig()
}

ulog(`Updating versions to ${isAlpha ? 'alpha' : 'Release'}`)
const newVersion = await updatePackageVersion({
  packagePath: corePackagePath,
  isAlpha: actionsEnv.eventName === 'pull_request',
  isBeta: actionsEnv.eventName === 'push',
})

await npmPublish({ packagePath: corePackagePath, isAlpha, isBeta })

if (!isLocalRun && !isAlpha) {
  await commitAndPush(`Pushing version: ${newVersion}`)
}
