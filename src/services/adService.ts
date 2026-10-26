/**
 * AdService - Manages Google Mobile Ads (Banner & Interstitial)
 * Features:
 * - Test AdMob IDs in dev
 * - Only displays banner on History and Insights
 * - Interstitial shown at most once per session, NEVER while writing
 * - Completely suppressed for Premium users
 */

export interface AdConfig {
  iosBannerId: string;
  androidBannerId: string;
  iosInterstitialId: string;
  androidInterstitialId: string;
}

// Google standard test IDs
export const TEST_AD_CONFIG: AdConfig = {
  iosBannerId: 'ca-app-pub-3940256099942544/2934735716',
  androidBannerId: 'ca-app-pub-3940256099942544/6300978111',
  iosInterstitialId: 'ca-app-pub-3940256099942544/4411468910',
  androidInterstitialId: 'ca-app-pub-3940256099942544/1033173712',
};

class AdServiceImpl {
  private interstitialShownThisSession = false;
  private isWriting = false;
  private onAdEventCallbacks: Set<(event: { type: 'interstitial'; testId: string }) => void> = new Set();

  public subscribe(cb: (event: { type: 'interstitial'; testId: string }) => void): () => void {
    this.onAdEventCallbacks.add(cb);
    return () => this.onAdEventCallbacks.delete(cb);
  }

  public setWritingState(writing: boolean): void {
    this.isWriting = writing;
  }

  public canShowBanner(isPremium: boolean): boolean {
    return !isPremium;
  }

  public tryShowInterstitial(isPremium: boolean, sourceScreen = 'navigation'): boolean {
    if (isPremium) {
      return false;
    }
    if (this.isWriting) {
      return false;
    }
    if (this.interstitialShownThisSession) {
      return false;
    }

    this.interstitialShownThisSession = true;
    this.onAdEventCallbacks.forEach((cb) =>
      cb({
        type: 'interstitial',
        testId: TEST_AD_CONFIG.iosInterstitialId,
      })
    );
    return true;
  }

  public resetSessionForTesting(): void {
    this.interstitialShownThisSession = false;
  }
}

export const adService = new AdServiceImpl();
