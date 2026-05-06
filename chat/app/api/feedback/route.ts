import { NextRequest, NextResponse } from "next/server";
import {
  API_TIMEOUT_MS,
  backendUnavailableError,
  buildGatewayHeaders,
  getDejaQConfig,
  isNextResponse,
  parseErrorDetail,
  proxyError,
} from "../_lib/dejaq";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const config = getDejaQConfig();
  if (isNextResponse(config)) return config;

  const body = await request.json();
  let response: Response;
  try {
    response = await fetch(`${config.apiBaseUrl}/v1/feedback`, {
      method: "POST",
      headers: buildGatewayHeaders(config.apiKey, body.deptSlug),
      body: JSON.stringify({
        response_id: body.responseId,
        rating: body.rating,
        ...(typeof body.comment === "string" && body.comment.trim()
          ? { comment: body.comment.trim() }
          : {}),
      }),
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
  } catch {
    return backendUnavailableError();
  }

  if (!response.ok) {
    return proxyError(response.status, await parseErrorDetail(response));
  }

  const data = await response.json();
  return NextResponse.json({ status: data.status, newScore: data.new_score });
}
