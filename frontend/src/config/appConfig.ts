interface AppConfig {
  contactEmail: string
  operatorName: string
  policyUpdateDate: string
  githubUrl: string
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
  contactEmail: env.CONTACT_EMAIL ?? import.meta.env.VITE_CONTACT_EMAIL ?? 'contact@example.com',
  operatorName: env.OPERATOR_NAME ?? import.meta.env.VITE_OPERATOR_NAME ?? 'Ho Sang Lee',
  policyUpdateDate:
    env.POLICY_UPDATE_DATE ?? import.meta.env.VITE_POLICY_UPDATE_DATE ?? '5 April 2026',
  githubUrl:
    env.GITHUB_URL ||
    import.meta.env.VITE_GITHUB_URL ||
    'https://github.com/leehosanganson/life-in-the-uk-quiz',
}

// Derive copyright year robustly from the last space-separated token of policyUpdateDate
const yearToken = appConfig.policyUpdateDate.split(' ').at(-1) ?? ''
const parsedYear = parseInt(yearToken, 10)
export const copyrightYear: string = isNaN(parsedYear)
  ? new Date().getFullYear().toString()
  : parsedYear.toString()
