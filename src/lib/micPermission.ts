/**
 * Soft mic priming for first-session coaching.
 * Web Speech will re-prompt on listen; this warms permission when getUserMedia exists.
 */
export type MicPermissionResult = "granted" | "denied" | "unsupported" | "unavailable";

export async function requestMicPermission(): Promise<MicPermissionResult> {
  if (typeof navigator === "undefined") {
    return "unavailable";
  }

  const media = navigator.mediaDevices;
  if (!media?.getUserMedia) {
    return "unsupported";
  }

  try {
    const stream = await media.getUserMedia({ audio: true });
    for (const track of stream.getTracks()) {
      track.stop();
    }
    return "granted";
  } catch {
    return "denied";
  }
}
