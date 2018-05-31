import {environment} from '../environments/environment';

export class AppConfig {

  public static readonly API_URL = environment.API_URL;
  public static readonly PUSHER_KEY = environment.PUSHER_KEY;
  public static readonly PUSHER_CLUSTER = environment.PUSHER_CLUSTER;

  // public static readonly TOKEN_ENDPOINT: string = Config.AUTH_SERVER_BASE + '/connect/token';
}
