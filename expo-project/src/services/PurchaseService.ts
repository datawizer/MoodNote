import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';

const REVENUECAT_APPLE_KEY = 'appl_moodnote_key_placeholder';
const REVENUECAT_GOOGLE_KEY = 'goog_moodnote_key_placeholder';

export class PurchaseService {
  public static async configure(): Promise<void> {
    const apiKey = Platform.OS === 'ios' ? REVENUECAT_APPLE_KEY : REVENUECAT_GOOGLE_KEY;
    await Purchases.configure({ apiKey });
  }

  public static async getOfferings(): Promise<PurchasesPackage[]> {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
        return offerings.current.availablePackages;
      }
      return [];
    } catch (e) {
      console.error('Error fetching offerings', e);
      return [];
    }
  }

  public static async purchase(pkg: PurchasesPackage): Promise<boolean> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return typeof customerInfo.entitlements.active['premium'] !== 'undefined';
    } catch (e: any) {
      if (!e.userCancelled) {
        console.error('Purchase error', e);
      }
      return false;
    }
  }

  public static async restore(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      return typeof customerInfo.entitlements.active['premium'] !== 'undefined';
    } catch (e) {
      console.error('Restore error', e);
      return false;
    }
  }

  public static async checkPremiumStatus(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return typeof customerInfo.entitlements.active['premium'] !== 'undefined';
    } catch {
      return false;
    }
  }
}
