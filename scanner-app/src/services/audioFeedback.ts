let successAudio: HTMLAudioElement | null = null;
let failureAudio: HTMLAudioElement | null = null;

function getSuccess(): HTMLAudioElement {
  if (!successAudio) {
    successAudio = new Audio('/assets/audio/success.mp3');
  }
  return successAudio;
}

function getFailure(): HTMLAudioElement {
  if (!failureAudio) {
    failureAudio = new Audio('/assets/audio/failure.mp3');
  }
  return failureAudio;
}

export function playSuccessSound(): void {
  void getSuccess().play().catch(() => undefined);
}

export function playFailureSound(): void {
  void getFailure().play().catch(() => undefined);
}
