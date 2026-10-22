/** @ui Alert — iOS system alert, owned by the device layer; screens call useAlert()(options). */
import { useDevice } from '@shell/device';

export function useAlert() {
  return useDevice().alert;
}
