import { ResponseType } from 'axios';

export type TournamentConfigType = {
  /**
   * Get tournament API endpoint
   * @return string
   */
  getApiEndpoint(): string;

  /**
   * Get tournament API key
   * @return string
   */
  getApiKey(): string;

  /**
   * Get API response timeout
   * @return number
   */
  getApiResponseTimeout(): number;

  /**
   * Get tournament API response type
   * @return ResponseType
   */
  getApiResponseType(): ResponseType;

  /**
   * Get tournament start after hours
   * @return number
   */
  getTournamentDefaultStartAfterHours(): number;

  /**
   * Get tournament url prefix
   * @return string
   */
  getTournamentUrlPrefix(): string;
};
