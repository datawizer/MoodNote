import mobileAds, {
  BannerAd,
  BannerAdSize,
  TestIds,
  InterstitialAd,
  AdEventType,
} from 'react-native-google-mobile-ads';

export class AdService {
  private static interstitial: InterstitialAd | null = null;
  private static interstitialLoaded = false;
  private static interstitialShownThisSession = false;
  private static isWriting = false;

  public static initialize(): void {
    mobileAds()
      .initialize()
      .then(() => {
        this.loadInterstitial();
      });
  }

  public static setWriting(writing: boolean): void {
    this.isWriting = writing;
  }

  public static loadInterstitial(): void {
    const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-3940256099942544/1033173712';
    this.interstitial = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    this.interstitial.addAdEventListener(AdEventType.LOADED, () => {
      this.interstitialLoaded = true;
    });

    this.interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      this.interstitialLoaded = false;
    });

    this.interstitial.load();
  }

  public static showInterstitial(isPremium: boolean): void {
    if (isPremium || this.isWriting || this.interstitialShownThisSession) {
      return;
    }

    if (this.interstitialLoaded && this.interstitial) {
      this.interstitial.show();
      this.interstitialShownThisSession = true;
    }
  }

  public static getBannerAdUnitId(): string {
    return __DEV__ ? TestIds.BANNER : 'ca-app-pub-3940256099942544/6300978111';
  }
}
