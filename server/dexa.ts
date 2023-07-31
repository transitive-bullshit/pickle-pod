import defaultKy from "ky";

export class DexaClient {
  readonly api: typeof defaultKy;
  readonly apiBaseUrl: string;

  constructor({
    // apiKey = process.env.DEXA_API_KEY,
    apiBaseUrl = process.env.DEXA_API_BASE_URL,
    ky = defaultKy,
  }: {
    // apiKey?: string
    apiBaseUrl?: string;
    ky?: typeof defaultKy;
  } = {}) {
    if (!apiBaseUrl) {
      throw new Error(
        `Error Dexa missing required "apiBaseUrl" or "DEXA_API_BASE_URL"`
      );
    }

    this.apiBaseUrl = apiBaseUrl;
    this.api = ky.extend({
      prefixUrl: apiBaseUrl,
    });
  }

  async generateDexaAnswerFromLex(queryOrQuestion: string) {
    const res = await this.api("api/lex", {
      searchParams: {
        q: queryOrQuestion,
      },
      headers: {
        Accept: "text/event-stream",
      },
      timeout: 30000,
    });

    // TODO: get streaming working
    return res.text();
  }
}
