import { Router, } from "./router";
import { RequestWithData, CorsOptions, RouterPlugin } from "./router-types";
import { addCorsHeaders, getDefaultCorsOptions, handleCorsPreFlight } from './cors-utils';

export interface CorsPluginOptions extends CorsOptions { }

export class CorsPlugin implements RouterPlugin {
  name = 'cors-plugin';
  private corsOpt: CorsOptions;

  constructor(opts?: CorsPluginOptions) {
    this.corsOpt = { ...getDefaultCorsOptions(), ...opts };
  }

  onInit(router: Router): void {
    // Handle CORS preflight requests
    router.use((req: RequestWithData) => {
      if (req.method === 'OPTIONS' && req.headers.has('Origin')) {
        const preflightRes = handleCorsPreFlight(this.corsOpt);
        return addCorsHeaders(preflightRes, req, this.corsOpt);
      }
      return null;
    });
  }

  async onResponse(req: Request, res: Response): Promise<Response | null> {
    // If request has an Origin header, add CORS headers to the response.
    if (req.headers.has('Origin')) {
      return addCorsHeaders(res, req, this.corsOpt);
    }
    return null;
  }
}