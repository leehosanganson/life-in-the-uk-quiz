interface AppConfig {
  contactEmail: string | undefined
  operatorName: string | undefined
  policyUpdateDate: string | undefined
  githubUrl: string | undefined
}

interface WindowEnv {
  CONTACT_EMAIL?: string
  OPERATOR_NAME?: string
  POLICY_UPDATE_DATE?: string
  GITHUB_URL?: string
}

interface WindowWithEnv extends Window {
  __ENV__?: WindowEnv
}

const env: WindowEnv = (window as WindowWithEnv).__ENV__ ?? {}

export const appConfig: AppConfig = {
  contactEmail: env.CONTACT_EMAIL || undefined,
  operatorName: env.OPERATOR_NAME || undefined,
  policyUpdateDate: env.POLICY_UPDATE_DATE || undefined,
  githubUrl: env.GITHUB_URL || undefined,
}

// Derive copyright year robustly from the last space-separated token of policyUpdateDate
const yearToken = appConfig.policyUpdateDate?.split(' ').at(-1) ?? ''
const parsedYear = parseInt(yearToken, 10)
export const copyrightYear: string = isNaN(parsedYear)
  ? new Date().getFullYear().toString()
  : parsedYear.toString()
